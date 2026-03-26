from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor
import torchaudio
import torch
import torch.nn.functional as F
import imageio_ffmpeg
import subprocess
import soundfile as sf
import os
import uuid

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

STUTTER_MODEL_PATH = "./checkpoint-2500"

# This is a highly accurate, pre-trained Speech Emotion model from HuggingFace.
# If you have your own emotion model in a local folder, just change this path!
SER_MODEL_PATH = "superb/wav2vec2-base-superb-er" 

print("Loading AI Models...")
try:
    # 1. Load Stuttering Model
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained("facebook/wav2vec2-base")
    stutter_model = Wav2Vec2ForSequenceClassification.from_pretrained(STUTTER_MODEL_PATH, use_safetensors=True)
    stutter_model.eval()
    
    # 2. Load Emotion Model
    print("Loading Pre-trained Emotion Model (This may take a moment to download the first time)...")
    ser_model = Wav2Vec2ForSequenceClassification.from_pretrained(SER_MODEL_PATH)
    ser_model.eval()
    
    print("✅ All AI Models Online!")
except Exception as e:
    print(f"❌ Error loading models: {e}")

@app.post("/analyze-audio")
async def analyze_audio(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    webm_path = f"{file_id}.webm"
    wav_path = f"{file_id}.wav"
    
    try:
        audio_bytes = await file.read()
        
        with open(webm_path, "wb") as f:
            f.write(audio_bytes)
            
        ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        result = subprocess.run([ffmpeg_exe, "-y", "-i", webm_path, wav_path], 
                                stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        if not os.path.exists(wav_path) or os.path.getsize(wav_path) == 0:
            error_msg = result.stderr.decode('utf-8')
            raise Exception(f"Audio conversion failed! Details: {error_msg}")
        
        data, sample_rate = sf.read(wav_path)
        
        if os.path.exists(webm_path): os.remove(webm_path)
        if os.path.exists(wav_path): os.remove(wav_path)

        if len(data.shape) > 1:
            waveform = torch.from_numpy(data.T).float()
        else:
            waveform = torch.from_numpy(data).unsqueeze(0).float()

        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
            
        waveform = waveform.squeeze().numpy()
        
        # We process the audio ONCE and feed it to BOTH models!
        inputs = feature_extractor(waveform, sampling_rate=16000, return_tensors="pt", padding=True)
        
        # === 1. STUTTERING INFERENCE ===
        with torch.no_grad():
            stutter_logits = stutter_model(**inputs).logits
            stutter_probs = F.softmax(stutter_logits, dim=-1)
            stutter_prob = stutter_probs[0][1].item()
            
        print(f"🤖 Stutter Confidence: {stutter_prob:.2f}")
        result_text = "Stuttering Detected" if stutter_prob > 0.50 else "Fluent"
        
        # === 2. EMOTION INFERENCE ===
        with torch.no_grad():
            ser_logits = ser_model(**inputs).logits
            predicted_emotion_id = torch.argmax(ser_logits, dim=-1).item()
            
            # The SUPERB model uses these exact 4 classes
            emotion_labels = {0: "Neutral", 1: "Happy", 2: "Angry", 3: "Sad"}
            emotion_text = emotion_labels.get(predicted_emotion_id, "Unknown")
            
        print(f"🎭 Emotion Detected: {emotion_text}")
        
        return {
            "status": "success", 
            "prediction": result_text,
            "emotion": emotion_text
        }

    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}\n")
        if os.path.exists(webm_path): os.remove(webm_path)
        if os.path.exists(wav_path): os.remove(wav_path)
        return {"status": "error", "message": str(e)}
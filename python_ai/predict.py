import sys
import json
import joblib
import os

# Matikan warning agar tidak mengganggu output JSON
import warnings
warnings.filterwarnings("ignore")

def predict_task(task_text):
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    
    # Cek apakah model sudah ditraining
    if not os.path.exists(model_path):
        return {
            "quadrant": "decide",
            "urgency_score": 0,
            "reasoning": "Model not found. Please run train.py first."
        }

    # Load model
    model = joblib.load(model_path)

    # Prediksi Kategori
    prediction = model.predict([task_text])[0]
    
    # Hitung probabilitas (confidence score)
    # model.predict_proba mengembalikan array probabilitas untuk setiap kelas
    probs = model.predict_proba([task_text])[0]
    max_prob = max(probs)
    urgency_score = int(max_prob * 100)

    # Buat reasoning sederhana (Model sederhana tidak bisa generate teks panjang seperti GPT)
    reasoning = f"Classified as '{prediction}' with {urgency_score}% confidence based on keyword analysis."

    return {
        "quadrant": prediction,
        "urgency_score": urgency_score,
        "reasoning": reasoning
    }

if __name__ == "__main__":
    # Ambil argumen dari command line
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No task provided"}))
        sys.exit(1)

    input_text = sys.argv[1]
    result = predict_task(input_text)
    
    # Print JSON output untuk ditangkap Laravel
    print(json.dumps(result))
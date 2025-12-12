import json
import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# 1. Load Dataset
try:
    with open('python_ai/dataset.json', 'r') as f:
        data = json.load(f)
except FileNotFoundError:
    print("Error: dataset.json not found!")
    exit(1)

df = pd.DataFrame(data)

# 2. Buat Pipeline (Vectorization + Model)
# TfidfVectorizer: Mengubah teks menjadi vektor angka berdasarkan frekuensi kata
# MultinomialNB: Algoritma Naive Bayes, standar untuk klasifikasi teks
model = make_pipeline(TfidfVectorizer(stop_words='english'), MultinomialNB())

# 3. Latih Model
print("Training model...")
model.fit(df['text'], df['label'])

# 4. Simpan Model
joblib.dump(model, 'python_ai/model.pkl')
print("Model saved to python_ai/model.pkl")

# Test sekilas
test_task = "Bayar tagihan listrik"
prediction = model.predict([test_task])[0]
print(f"Test prediction for '{test_task}': {prediction}")
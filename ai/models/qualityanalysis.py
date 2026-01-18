

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# ==========================================
# 1. DATA SIMULATION (Creating crop_quality_data.csv)
# ==========================================
# Simulating 200 lab test results
data = pd.DataFrame({
    'moisture_percent': np.random.uniform(9, 18, 200),       # 10-14% is ideal
    'protein_content': np.random.uniform(8, 16, 200),        # Higher is better
    'foreign_matter_percent': np.random.uniform(0, 5, 200),  # Dirt/Stones (Lower is better)
    'grain_size': np.random.uniform(2, 6, 200)               # mm (Larger is often better)
})

# Generate Ground Truth Grades based on Industry Standards (e.g., FCI - Food Corp of India rules)
grades = []
for i, row in data.iterrows():
    # Scoring Logic: Start with 100 points
    score = 100
    
    # Penalize High Moisture (Risk of fungus)
    if row['moisture_percent'] > 14: score -= (row['moisture_percent'] - 14) * 5
    if row['moisture_percent'] < 10: score -= (10 - row['moisture_percent']) * 2 # Too dry is bad too but less severe
    
    # Reward Protein
    score += (row['protein_content'] - 12) * 2
    
    # Penalize Foreign Matter (Critical Factor)
    score -= row['foreign_matter_percent'] * 10
    
    # Grading Scale
    if score >= 90: grades.append('A+')
    elif score >= 80: grades.append('A')
    elif score >= 70: grades.append('B')
    else: grades.append('C')

data['quality_grade'] = grades

print("✅ Data Loaded: 200 Quality Tests Simulated")
print(data.head())

# ==========================================
# 2. MODEL TRAINING (Random Forest)
# ==========================================
# WHY RANDOM FOREST?
# It handles non-linear relationships well (e.g., moisture is bad if too high OR too low).
# It's robust and rarely overfits on simple tabular data like this.

X = data.drop('quality_grade', axis=1)
y = data['quality_grade']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=50, random_state=42)
clf.fit(X_train, y_train)

print("\n⚙️ Quality Grading Model Trained.")

# ==========================================
# 3. EVALUATION
# ==========================================
predictions = clf.predict(X_test)
print(f"\n📊 Model Accuracy: {accuracy_score(y_test, predictions)*100:.2f}%")
print(classification_report(y_test, predictions))

# ==========================================
# 4. PREDICTION FUNCTION
# ==========================================
def predict_quality(moisture, protein, foreign_matter, size):
    """
    Predicts the Grade (A+, A, B, C) based on lab metrics.
    """
    input_data = pd.DataFrame([{
        'moisture_percent': moisture,
        'protein_content': protein,
        'foreign_matter_percent': foreign_matter,
        'grain_size': size
    }])
    
    grade = clf.predict(input_data)[0]
    
    # Explain reasoning (Rule-based augmentation for user trust)
    reasoning = []
    if moisture > 14: reasoning.append("High moisture detected.")
    if foreign_matter > 2: reasoning.append("High impurities found.")
    if protein > 13: reasoning.append("Excellent protein content.")
    
    if not reasoning: reasoning.append("Parameters within standard range.")
    
    return grade, ", ".join(reasoning)

# ==========================================
# 5. DEMO USAGE
# ==========================================
print("\n🔮 --- DEMO QUALITY CHECK ---")
# Scenario: Good crop but slightly wet
q_grade, q_reason = predict_quality(
    moisture=14.5, 
    protein=12.5, 
    foreign_matter=1.0, 
    size=4.5
)

print(f"🧪 Lab Results Analysis:")
print(f"   - Moisture: 14.5% (High)")
print(f"   - Impurities: 1.0%")
print(f"🏆 Predicted Grade: {q_grade}")
print(f"📝 AI Remarks: {q_reason}")
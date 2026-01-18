
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder

# ==========================================
# 1. DATA SIMULATION (Creating demand_data.csv)
# ==========================================
# Simulating a dataset of 100 records
data = pd.DataFrame({
    'year': np.random.choice([2022, 2023, 2024], 100),
    'quarter': np.random.choice([1, 2, 3, 4], 100),
    'crop': np.random.choice(['Wheat', 'Rice', 'Corn', 'Soybean'], 100),
    'export_demand': np.random.randint(1000, 5000, 100), # In Tons
    'domestic_demand': np.random.randint(5000, 20000, 100), # In Tons
    'market_trend': np.random.choice(['Growing', 'Stable', 'Declining'], 100)
})

# Generate Target Variable 'demand_level' based on rules
# Rule 1: High Export + Growing Trend = High Demand
# Rule 2: Low Domestic + Declining Trend = Low Demand
demand_levels = []
for i, row in data.iterrows():
    total_demand = row['export_demand'] + row['domestic_demand']
    
    if row['market_trend'] == 'Growing' and total_demand > 15000:
        demand_levels.append('High')
    elif row['market_trend'] == 'Declining' and total_demand < 10000:
        demand_levels.append('Low')
    else:
        demand_levels.append('Medium')

data['demand_level'] = demand_levels

print("✅ Data Loaded: 100 Market Scenarios Simulated")
print(data.head())

# ==========================================
# 2. DATA PREPROCESSING
# ==========================================
# Encoding Target Variable (High/Medium/Low -> 0, 1, 2)
le = LabelEncoder()
data['demand_level_encoded'] = le.fit_transform(data['demand_level'])

# One-Hot Encoding for Features (Crop, Market Trend)
X = pd.get_dummies(data.drop(['demand_level', 'demand_level_encoded'], axis=1), drop_first=True)
y = data['demand_level_encoded']

# Save column names for prediction alignment later
feature_columns = X.columns

# Split Data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. MODEL TRAINING (Decision Tree)
# ==========================================
# WHY DECISION TREE?
# Unlike black-box models, Decision Trees follow clear "If-Then" rules.
# This allows us to explain to a buyer: "Demand is High BECAUSE export volume > 4000 tons."
clf = DecisionTreeClassifier(max_depth=4, random_state=42)
clf.fit(X_train, y_train)

print("\n⚙️ Decision Tree Trained.")

# ==========================================
# 4. EVALUATION & EXPLAINABILITY
# ==========================================
predictions = clf.predict(X_test)
print(f"\n📊 Model Accuracy: {accuracy_score(y_test, predictions)*100:.2f}%")

# Print the Decision Path (The "Why")
print("\n🌳 DECISION LOGIC (Text Representation):")
tree_rules = export_text(clf, feature_names=list(X.columns))
print(tree_rules)

# ==========================================
# 5. PREDICTION FUNCTION
# ==========================================
def classify_demand(year, quarter, crop, export, domestic, trend):
    """
    Classifies demand as High, Medium, or Low based on input metrics.
    """
    input_data = {
        'year': [year],
        'quarter': [quarter],
        'export_demand': [export],
        'domestic_demand': [domestic],
        # Categorical fields handled via dummy variables logic below
        'crop': [crop],
        'market_trend': [trend]
    }
    
    # Create DataFrame
    input_df = pd.DataFrame(input_data)
    
    # One-Hot Encode
    input_encoded = pd.get_dummies(input_df)
    
    # ALIGNMENT HACK: Ensure input has exact same columns as training data
    # (If 'market_trend_Declining' is missing in input, add it with 0)
    input_encoded = input_encoded.reindex(columns=feature_columns, fill_value=0)
    
    # Predict
    pred_code = clf.predict(input_encoded)[0]
    pred_label = le.inverse_transform([pred_code])[0]
    
    return pred_label

# ==========================================
# 6. DEMO USAGE
# ==========================================
print("\n🔮 --- DEMO FORECAST ---")
# Scenario: High exports and growing trend
forecast_result = classify_demand(
    year=2025, 
    quarter=1, 
    crop='Soybean', 
    export=4500, 
    domestic=12000, 
    trend='Growing'
)

print(f"🤖 AI Forecast for Soybean (Q1 2025): {forecast_result} Demand")
if forecast_result == 'High':
    print("💡 Advice: Supply may run out. Pre-book contracts now.")
else:
    print("💡 Advice: Market is stable. Standard procurement applies.")
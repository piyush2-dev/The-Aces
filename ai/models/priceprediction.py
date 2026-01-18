

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# ==========================================
# 1. DATA SIMULATION (Creating market_prices.csv content)
# ==========================================
# In a real app, you would load this: data = pd.read_csv('market_prices.csv')
data = pd.DataFrame({
    'year': [2020, 2020, 2021, 2021, 2022, 2022, 2023, 2023, 2024, 2024] * 5,
    'month': [3, 10, 3, 10, 3, 10, 3, 10, 3, 10] * 5, # 3=Harvest(Rabi), 10=Harvest(Kharif)
    'crop': ['Wheat', 'Rice', 'Wheat', 'Rice', 'Wheat', 'Rice', 'Wheat', 'Rice', 'Wheat', 'Rice'] * 5,
    'season': ['Rabi', 'Kharif', 'Rabi', 'Kharif', 'Rabi', 'Kharif', 'Rabi', 'Kharif', 'Rabi', 'Kharif'] * 5,
    'volatility_index': np.random.uniform(10, 25, 50), # Market fear index
    'inflation_rate': np.random.uniform(4, 7, 50),     # Annual inflation %
    'avg_price_per_quintal': []                        # Target variable
})

# Generate realistic target prices based on simple logic + noise
for i, row in data.iterrows():
    base_price = 2000 if row['crop'] == 'Wheat' else 1900
    yearly_increase = (row['year'] - 2020) * 100 # Prices rise every year
    inflation_impact = row['inflation_rate'] * 20
    noise = np.random.normal(0, 50)
    
    final_price = base_price + yearly_increase + inflation_impact + noise
    data.loc[i, 'avg_price_per_quintal'] = final_price

print("✅ Data Loaded: 50 Records Simulated")
print(data.head())

# ==========================================
# 2. DATA PREPROCESSING
# ==========================================
# One-Hot Encoding for categorical variables (Crop, Season)
# This converts 'Wheat' into a mathematical format [1, 0]
data_encoded = pd.get_dummies(data, columns=['crop', 'season'], drop_first=True)

# Define Features (X) and Target (y)
X = data_encoded.drop('avg_price_per_quintal', axis=1)
y = data_encoded['avg_price_per_quintal']

# Split Data: 80% for Training, 20% for Testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 3. MODEL TRAINING (Linear Regression)
# ==========================================
# WHY LINEAR REGRESSION?
# 1. Interpretability: Farmers trust simple trends ("Price goes up as Year goes up").
# 2. Stability: Less prone to overfitting on small agricultural datasets compared to Neural Networks.
model = LinearRegression()
model.fit(X_train, y_train)

print("\n⚙️ Model Training Complete.")

# ==========================================
# 4. EVALUATION
# ==========================================
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"📊 Model Accuracy (R² Score): {r2:.2f}")
print(f"📉 Mean Squared Error: {mse:.2f}")

# ==========================================
# 5. PREDICTION FUNCTION (The 'AI' Feature)
# ==========================================
def predict_future_price(year, month, crop, season, volatility, inflation):
    """
    Takes raw inputs, matches the model's expected format, and returns a price.
    """
    # Create input dictionary
    input_data = {
        'year': [year],
        'month': [month],
        'volatility_index': [volatility],
        'inflation_rate': [inflation],
        'crop': [crop],
        'season': [season]
    }
    
    # Convert to DataFrame
    input_df = pd.DataFrame(input_data)
    
    # Encode exactly like training data
    input_encoded = pd.get_dummies(input_df, columns=['crop', 'season'], drop_first=True)
    
    # ALIGN COLUMNS: Ensure input has same columns as X_train, fill missing with 0
    # (Critical step to prevent errors when predicting a single row)
    input_encoded = input_encoded.reindex(columns=X.columns, fill_value=0)
    
    # Predict
    predicted_price = model.predict(input_encoded)[0]
    return round(predicted_price, 2)

# ==========================================
# 6. DEMO USAGE
# ==========================================
print("\n🔮 --- DEMO PREDICTION ---")
future_price = predict_future_price(
    year=2025, 
    month=3, 
    crop='Wheat', 
    season='Rabi', 
    volatility=15.5, 
    inflation=6.2
)

print(f"🤖 AI Prediction for Wheat (March 2025): ₹{future_price} per Quintal")
print(f"💡 Advice: Lock this price in the contract now to avoid volatility.")
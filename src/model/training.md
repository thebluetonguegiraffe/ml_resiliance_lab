# Credit Card Fraud Detection model training

This project trains a machine learning model for detecting fraudulent credit card transactions using the Kaggle Credit Card Fraud Detection dataset. The dataset contains transactions made by European cardholders in September 2013.

### Dataset Features

The dataset represents a typical real-world financial scenario:

* **V1 - V28:** Numerical variables resulting from a Principal Component Analysis (PCA) transformation. Original features (such as location or merchant name) are hidden for confidentiality.
* **Time:** Seconds elapsed between each transaction and the first transaction in the dataset.
* **Amount:** The transaction amount, which can be used for cost-sensitive learning.
* **Class (Target):** The response variable where **0** represents a legitimate transaction and **1** represents fraud.

### Training Approaches

The pipeline supports two different ensemble methods:

1. **Random Forest:** An ensemble of decision trees built in parallel using bagging. Each tree is trained independently on a random subset of data and features. The final prediction is an average or majority vote. It is highly robust against overfitting.
2. **XGBoost (Extreme Gradient Boosting):** A boosting method that builds trees sequentially. Each new tree focuses on correcting the errors made by the previous ones. It is generally more powerful than Random Forest but requires more careful hyperparameter tuning.

### Additional Insights

- Note that neither model requires feature scaling. Both are tree-based models that split nodes based on value thresholds, making them invariant to the scale of the input features.
- XGBoost uses a learning rate (also known as shrinkage) to scale the contribution of each new tree added to the model. By slowing down the learning process (using a value between 0 and 1), the model becomes more conservative, preventing it from overfitting to the residuals of the previous trees and allowing for better generalization on unseen data.

### Evaluation Metric: AUPRC

In this dataset, only 0.172% of transactions are fraudulent. Standard accuracy is misleading because a model could achieve 99.8% accuracy by simply predicting that no transaction is ever fraudulent. We use the **Area Under the Precision-Recall Curve (AUPRC)** because it focuses on the performance of the minority class (Fraud) and ignores the large number of correctly predicted legitimate transactions that inflate other metrics.

### MLOps with MLflow

MLflow is used to manage the machine learning lifecycle, ensuring experiments are reproducible and models are versioned.

* **log_metric:** Used to store numerical results (such as AUPRC, Recall, or F1-score). This allows for visual comparison between different runs and models in the MLflow UI.
* **log_model:** Saves the trained model object along with its environment dependencies (requirements.txt). This ensures that the model can be deployed later in a consistent environment.
* **evaluate:** This specialized function performs an automated audit of the model. It uses a dedicated evaluation dataset to generate standardized visualizations like Confusion Matrices and Precision-Recall curves, which are then saved as artifacts.

### Models evaluated

Three runs were tracked in MLflow under the `fraud-detection` experiment:

| Run              | Model        | ROC-AUC          | Recall (fraud)  | PR-AUC          | False Negatives |
| ---------------- | ------------ | ---------------- | --------------- | --------------- | --------------- |
| baseline         | RandomForest | **0.9917** | **0.889** | 0.931           | **5**     |
| baseline         | XGBoost      | 0.9810           | 0.867           | **0.931** | 6               |
| scale_pos_weight | XGBoost      | 0.9753           | 0.844           | 0.827           | 7               |

#### Conclusions

**RandomForest wins on this dataset.** The V1-V28 features are PCA-transformed and already clean and linearly separable — a terrain where RF performs very well without additional tuning.

**XGBoost did not benefit from `scale_pos_weight`.** Adding the imbalance correction actually degraded all metrics. The model without it was already handling the imbalance adequately, and the weight pushed it toward more aggressive fraud predictions that introduced noise.

**Recall is the key metric in fraud detection.** A false negative (missed fraud) is significantly more costly than a false positive (blocked legitimate transaction). By this criterion RF is the clear winner with 5 false negatives vs 6-7 for XGBoost.

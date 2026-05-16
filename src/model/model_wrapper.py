import mlflow
import pandas as pd


class FraudModelWrapper(mlflow.pyfunc.PythonModel):
    def __init__(self, model):
        self.model = model

    def predict(self, context, model_input):
        predictions = self.model.predict(model_input)

        probabilities = self.model.predict_proba(model_input)[:, 1]

        return pd.DataFrame({"pred_class": predictions, "fraud_probability": probabilities})

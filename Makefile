mflow:
	mlflow ui --backend-store-uri sqlite:///src/model/mlflow.db

.PHONY: start-mlflow stop-mlflow logs-mlflow
start-mlflow:
	docker compose up --build -d

stop-mlflow:
	docker compose down

logs-mlflow:
	docker compose logs -f mlflow-serve
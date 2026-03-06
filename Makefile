.PHONY: backend frontend

backend:
	cd backend/charted-backend && sam build && sam local start-api --env-vars env.json

frontend:
	cd frontend && APP_ENV=development npx expo start --tunnel
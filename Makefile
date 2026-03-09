.PHONY: backend frontend

backend:
	cd backend/charted-backend && sam build && sam local start-api --env-vars env.json

deploy:
	cd backend/charted-backend && sam build && sam deploy

frontend:
	cd frontend && npx expo start --tunnel
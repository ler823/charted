.PHONY: backend frontend

backend:
	cd backend/charted-backend && sam build && sam local start-api

deploy:
	cd backend/charted-backend && sam build && sam deploy

frontend:
	cd frontend && npm install && npx expo start --tunnel
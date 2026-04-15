.PHONY: backend frontend deploy

backend:
	cd backend/charted-backend && sam build && sam local start-api

deploy:
	cd backend/charted-backend && sam build && sam deploy

frontend:
	@cd frontend && \
	npm install && \
	until npx expo start -c --tunnel; do \
		echo "Expo failed. Restarting..."; \
	done
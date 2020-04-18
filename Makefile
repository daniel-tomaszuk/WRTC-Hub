update-deps:
	pip install pip-tools
	pip-compile --generate-hashes ./app/requirements/dev.in --output-file ./app/requirements/dev.txt
	pip-compile --generate-hashes ./app/requirements/requirements.in --output-file ./app/requirements/requirements.txt

format:
	black ./app --skip-string-normalization
	isort --apply

run-tests:
	pytest -v ./app/


build:
	@docker-compose up --force-recreate --build

up:
	@docker-compose up

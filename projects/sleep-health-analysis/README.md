# Sleep Health & Lifestyle Analysis

This is a **DataCamp guided project** completed with Python and pandas. The notebook in this folder is a clean, reproducible presentation of the analysis; it does not reproduce the course instructions.

## Project files

- [Analysis notebook](sleep-health-analysis.ipynb)
- [Supplied dataset](sleep_health_data.csv)
- [Project artwork](insomnia.jpg)

## Questions explored

- Which occupation has the lowest average sleep duration?
- Which occupation has the lowest average sleep quality?
- What share of each BMI category is recorded with insomnia?

## Results

- Sales Representatives had the lowest average sleep duration (5.9 hours) and sleep quality (4/10). This group contains only **2 records**.
- The observed insomnia share was 4.2% for Normal BMI (9/216), 43.2% for Overweight (64/148), and 40.0% for Obese (4/10).

These are descriptive patterns in the supplied anonymized sample. They do not establish causation or clinical conclusions. Small groups, particularly Sales Representatives and the Obese category, make their estimates sensitive to individual records.

## Run the notebook

Install Python with pandas and Jupyter, then open `sleep-health-analysis.ipynb` from this folder. The notebook reads `sleep_health_data.csv` from the same directory.

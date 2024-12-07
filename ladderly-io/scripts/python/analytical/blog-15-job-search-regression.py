# analysis supporting blog article
# `15. On Cover Letters and Resume Tailoring`
# found at
# `blog/2024-08-04-no-cover-letters.md`
# explains interview attainment

import pandas as pd
import statsmodels.api as sm

# Load the CSV file
file_path = './blog-15-job-search-regression.csv'
df = pd.read_csv(file_path)

# Step 1 of 3: Construct Variables
def determine_interview_corrected(status):
    status = status.lower()
    if status in ['rejected, pre-r1', 'r1 cancelled', 'applied', 'timed out']:
        return 0
    return 1

# Apply the function to the Status column to create the attained_interview column
df['attained_interview'] = df['Status'].apply(lambda x: determine_interview_corrected(x))

# Calculate `is_low_effort`
df['is_low_effort'] = ((df['Contact Role'].str.lower() == 'skipped') & (df['Job Post Title'].str.lower() == 'skipped')).astype(int)

# Convert `Company` and `Resume Version` to categorical codes
df['Company'] = df['Company'].astype('category').cat.codes
df['Resume Version'] = df['Resume Version'].astype('category').cat.codes

# Create dummy variables for Referral and Inbound Opportunity
df['Referral'] = (df['Referral'].str.upper() == 'YES').astype(int)
df['Inbound Opportunity'] = df['Inbound Opportunity'].astype(int)

# Step 2 of 3: Validate Features
# Expected values
expected_total_inbound = 17
expected_inbound_attained_interview = 14

# Actual values
total_inbound = df['Inbound Opportunity'].sum()
inbound_attained_interview = df[(df['Inbound Opportunity'] == 1) & (df['attained_interview'] == 1)].shape[0]

# Print validation results
if total_inbound == expected_total_inbound:
    print(f"Success: Total inbound records = {total_inbound}")
else:
    print(f"Failure: Total inbound records = {total_inbound}, expected {expected_total_inbound}")

if inbound_attained_interview == expected_inbound_attained_interview:
    print(f"Success: Inbound records that attained interview = {inbound_attained_interview}")
else:
    print(f"Failure: Inbound records that attained interview = {inbound_attained_interview}, expected {expected_inbound_attained_interview}")

# Step 3 of 3: Run Multiple Regression
X = df[['is_low_effort', 'Resume Version', 'Company', 'Referral', 'Inbound Opportunity']]
y = df['attained_interview']
X = sm.add_constant(X)
model = sm.OLS(y, X).fit()
print(model.summary())

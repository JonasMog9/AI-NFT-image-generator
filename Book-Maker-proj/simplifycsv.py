import pandas as pd

# Load the CSV file again
file_path = '/mnt/data/processed_nft_stats.csv'
df = pd.read_csv(file_path)

# Function to format the attributes into a descriptive string
def format_attributes(attributes):
    # Parse the string representation of a dictionary into an actual dictionary
    attributes_dict = eval(attributes)
    # Format the attributes as 'key:value' pairs, skip if value is None
    formatted_attributes = ', '.join(f"{key}:{value}" if value is not None else f"{key}:NULL" for key, value in attributes_dict.items())
    return formatted_attributes

# Apply the formatting function to each row
df['formatted_attributes'] = df['extracted_attributes'].apply(format_attributes)

# Create a new dataframe with only the necessary columns
new_df = df[['token_id', 'formatted_attributes']]

# Save the new dataframe to a CSV file
new_file_path = '/mnt/data/formatted_nft_stats.csv'
new_df.to_csv(new_file_path, index=False)

new_file_path
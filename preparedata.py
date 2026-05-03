import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer

# Load the CSV
df = pd.read_csv("books.csv")

# Drop missing values and limit
df = df.dropna(subset=["title", "authors", "isbn"]).head(1000)

titles = df["title"].tolist()
authors = df["authors"].tolist()
isbns = df["isbn"].tolist()
descriptions = [f"{t} by {a}" for t, a in zip(titles, authors)]

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Generate embeddings
print("🔄 Generating embeddings...")
embeddings = model.encode(descriptions, show_progress_bar=True)

# Save files
np.save("book_embeddings.npy", embeddings)

with open("book_titles.txt", "w", encoding="utf-8") as f:
    for title in titles:
        f.write(title + "\n") 

with open("book_authors.txt", "w", encoding="utf-8") as f:
    for author in authors:
        f.write(author + "\n")

with open("book_isbns.txt", "w", encoding="utf-8") as f:
    for isbn in isbns:
        f.write(isbn + "\n")

print("✅ Data saved.")

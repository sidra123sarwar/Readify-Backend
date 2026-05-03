import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load data
embeddings = np.load("book_embeddings.npy")

def load_file(path):
    with open(path, encoding="utf-8") as f:
        return [line.strip() for line in f.readlines()]

titles = load_file("book_titles.txt")
authors = load_file("book_authors.txt")
isbns = load_file("book_isbns.txt")
 
model = SentenceTransformer("all-MiniLM-L6-v2")

def get_cover(isbn):
    return f"https://covers.openlibrary.org/b/isbn/{isbn}-M.jpg"

def recommend(user_input):
    user_embedding = model.encode([user_input])
    similarities = cosine_similarity(user_embedding, embeddings)
    top_indices = similarities[0].argsort()[-5:][::-1]

    results = [{
        "title": titles[i],
        "author": authors[i],
        "isbn": isbns[i],
        "cover": get_cover(isbns[i]),
        "score": float(similarities[0][i])
    } for i in top_indices]
    
    return results

if __name__ == "__main__":
    user_input = sys.argv[1]
    recommendations = recommend(user_input)
    print(json.dumps({"recommendations": recommendations}), end="")

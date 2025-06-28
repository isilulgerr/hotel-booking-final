from app.firebase import db_firestore

def add_comment(data):
    db_firestore.collection("comments").add(data)
    return {"msg": "Comment added"}

def get_comments_with_averages(room_id):
    comments = db_firestore.collection("comments").where("room_id", "==", room_id).stream()
    comment_list = []
    rating_totals = {}
    rating_counts = {}

    for c in comments:
        data = c.to_dict()
        comment_list.append(data)
        service = data["service_type"]
        rating = int(data["rating"])

        rating_totals[service] = rating_totals.get(service, 0) + rating
        rating_counts[service] = rating_counts.get(service, 0) + 1

    averages = {
        service: round(rating_totals[service] / rating_counts[service], 2)
        for service in rating_totals
    }

    return {
        "comments": comment_list,
        "service_averages": averages
    }

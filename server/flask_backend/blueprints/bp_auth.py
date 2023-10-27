from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, login_required, current_user
from models import Users, db


bp_auth = Blueprint("auth", __name__)


@bp_auth.route("/register", methods=["POST"])
def register():
    print("Registering new user")
    try:
        data = request.get_json()
        username = data["username"]
        email = data["email"]
        password = data["password"]
        password_hash = generate_password_hash(password)

        if Users.query.filter_by(username=username).first():
            return jsonify({"message": "Username already exists!"}), 400

        if Users.query.filter_by(email=email).first():
            return jsonify({"message": "Email already exists!"}), 400

        new_user = Users(username=username, email=email, password_hash=password_hash)

        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "New user created!"}), 201
    except Exception as e:
        print(f"Error creating new user: {e}")
        return jsonify({"message": f"Error creating new user: {e}"}), 400


@bp_auth.route("/login", methods=["POST"])
def login():
    print("Logging in user")
    try:
        data = request.get_json()
        login = data["login"]  # can be either username or email
        password = data["password"]

        user = (
            Users.query.filter_by(username=login).first()
            or Users.query.filter_by(email=login).first()
        )

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Username or password is incorrect!"}), 400

        login_user(user)
        return (
            jsonify({"message": "Logged in successfully!", "username": user.username}),
            200,
        )
    except Exception as e:
        print(f"Error logging in: {e}")
        return jsonify({"message": f"Error logging in: {e}"}), 400


@bp_auth.route("/logout", methods=["POST"])
@login_required
def logout():
    print("Logging out user", current_user.username)
    try:
        logout_user()
        return jsonify({"message": "Logged out successfully!"}), 200
    except Exception as e:
        return jsonify({"message": f"Error logging out: {e}"}), 400
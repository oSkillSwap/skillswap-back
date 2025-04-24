import { Availability } from "./availability.model.js";
import { Category } from "./category.model.js";
import { Message } from "./message.model.js";
import { Post } from "./post.model.js";
import { Proposition } from "./proposition.model.js";
import { Review } from "./review.model.js";
import { Skill } from "./skill.model.js";
import { User } from "./user.model.js";

// User 0,N <-> 0,N Message
// User can send several messages, User can receive several messages
// Message can be sent by one user, Message can be received by one user
User.hasMany(Message, { as: "SentMessages", foreignKey: "sender_id" });
User.hasMany(Message, { as: "ReceivedMessages", foreignKey: "receiver_id" });
Message.belongsTo(User, { as: "Sender", foreignKey: "sender_id" });
Message.belongsTo(User, { as: "Receiver", foreignKey: "receiver_id" });

// User 0,N <-> 0,N Follow
// User can follow several users, User can be followed by several users
// Follow can be done by one user, Follow can be done to one user
User.belongsToMany(User, {
  through: "follow",
  as: "Follows",
  foreignKey: "follower_id",
  otherKey: "followed_id",
});
User.belongsToMany(User, {
  through: "follow",
  as: "Followers",
  foreignKey: "followed_id",
  otherKey: "follower_id",
});
// Follow.belongsTo(User, { as: "Follower", foreignKey: "follower_id" });
// Follow.belongsTo(User, { as: "Followed", foreignKey: "followed_id" });

// User 0,N <-> 1,1 Post
// User can create several posts, Post can be created by one user
User.hasMany(Post, { as: "Posts", foreignKey: "user_id" });
Post.belongsTo(User, { as: "Author", foreignKey: "user_id", allowNull: false });

// User 0,N <-> 1,1 Proposition
// User can create several propositions, User can receive several propositions
// Proposition can be created by just one user, Proposition can be received by just one user
User.hasMany(Proposition, { as: "SentPropositions", foreignKey: "sender_id" });
User.hasMany(Proposition, {
  as: "ReceivedPropositions",
  foreignKey: "receiver_id",
});
Proposition.belongsTo(User, {
  as: "Sender",
  foreignKey: "sender_id",
  allowNull: false,
});
Proposition.belongsTo(User, {
  as: "Receiver",
  foreignKey: "receiver_id",
  allowNull: false,
});

// User 0,N <-> 1,1 Review
// User can create and receive several reviews
// Review can be created by just one user, Review can be received by just one user
User.hasMany(Review, { as: "Reviews", foreignKey: "user_id" });
Review.belongsTo(User, {
  as: "Reviewer",
  foreignKey: "user_id",
  allowNull: false,
});

// Review 1,1 <-> 0,1 Proposition
// Proposition can have one review, Review can be created for just one proposition
Proposition.hasOne(Review, { foreignKey: "proposition_id" });
Review.belongsTo(Proposition, {
  foreignKey: "proposition_id",
  allowNull: false,
});

// Proposition 0,1 <-> 0,N Post
// Post can have several propositions, Proposition can be created for one post
Post.hasMany(Proposition, { foreignKey: "post_id" });
Proposition.belongsTo(Post, { foreignKey: "post_id" });

// Skill 1,1 <-> 0,N Category
// Category can have several skills, Skill can belong to just one category
Category.hasMany(Skill, { foreignKey: "category_id" });
Skill.belongsTo(Category, { foreignKey: "category_id", allowNull: false });

// User 0,N <-> 0,N Skill (has)
// User can have several skills, Skill can be owned by several users
// Skill can be owned by several users, User can have several skills
User.belongsToMany(Skill, {
  through: "UserHasSkill",
  as: "Skills",
  foreignKey: "user_id",
  otherKey: "skill_id",
});
Skill.belongsToMany(User, {
  through: "UserHasSkill",
  as: "UsersWithSkill",
  foreignKey: "skill_id",
  otherKey: "user_id",
});

// User 0,N <-> 0,N Skill (wants)
// User can want several skills, Skill can be wanted by several users
// Skill can be wanted by several users, User can want several skills
User.belongsToMany(Skill, {
  through: "UserWantsSkill",
  as: "WantedSkills",
  foreignKey: "user_id",
  otherKey: "skill_id",
});
Skill.belongsToMany(User, {
  through: "UserWantsSkill",
  as: "UsersWantingSkill",
  foreignKey: "skill_id",
  otherKey: "user_id",
});

// User 0,N <-> 0,N Availability
// User can have several availabilities, Availability can be owned by several users
// Availability can be owned by several users, User can have several availabilities
User.belongsToMany(Availability, {
  through: "UserHasAvailability",
  as: "Availabilities",
  foreignKey: "user_id",
  otherKey: "availability_id",
});
Availability.belongsToMany(User, {
  through: "UserHasAvailability",
  as: "Users",
  foreignKey: "availability_id",
  otherKey: "user_id",
});

export {
  User,
  Message,
  Post,
  Proposition,
  Review,
  Skill,
  Availability,
  Category,
};

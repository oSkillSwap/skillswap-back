import { faker } from "@faker-js/faker";
import { sequelize } from "../data/client.js";
import {
  Availability,
  Category,
  Message,
  Post,
  Proposition,
  Review,
  Skill,
  User,
} from "../models/associations.js";
import argon2 from "argon2";

await sequelize.sync({ force: true });
console.log("\u{1F4BE} Base synchronisée, début du seed...");

// ----------------------
// 1. CATÉGORIES & COMPÉTENCES AVEC ICÔNES LUCIDE
// ----------------------
const categoryData = [
  {
    name: "Informatique",
    icon: "MonitorSmartphone",
    skills: ["Mac", "Linux", "Windows", "Android", "iPhone"],
  },
  {
    name: "Programmation",
    icon: "Code2",
    skills: ["JS", "Python", "PHP", "NodeJS", "NGINX", "Apache", "WordPress"],
  },
  {
    name: "Développement personnel",
    icon: "HeartPulse",
    skills: ["Respiration", "Yoga"],
  },
  {
    name: "Langues Étrangères",
    icon: "Languages",
    skills: [
      "Français",
      "Anglais",
      "Italien",
      "Espagnol",
      "Allemand",
      "Mandarin",
      "Arabe",
      "Russe",
      "Japonais",
    ],
  },
  {
    name: "Bricolage",
    icon: "Hammer",
    skills: ["Maçonnerie", "Électricité", "Plomberie"],
  },
  {
    name: "Scolaire",
    icon: "GraduationCap",
    skills: ["Maths", "Géographie", "Histoire", "Physique", "Philo"],
  },
];

const categories = [];
const skills = [];

for (const cat of categoryData) {
  const category = await Category.create({
    name: cat.name,
    icon: cat.icon,
  });
  categories.push(category);

  for (const skillName of cat.skills) {
    const skill = await Skill.create({ name: skillName, category_id: category.id });
    skills.push(skill);
  }
}

// ----------------------
// 2. DISPONIBILITÉS
// ----------------------
const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const creneaux = ["matin", "midi", "après-midi", "soir"];
const availabilities = [];
for (const jour of jours) {
  for (const creneau of creneaux) {
    const avail = await Availability.create({
      day_of_the_week: jour,
      time_slot: creneau,
    });
    availabilities.push(avail);
  }
}

// ----------------------
// 3. UTILISATEURS
// ----------------------
const memberPasswordHash = await argon2.hash("Password1+");
const adminPasswordHash = await argon2.hash("SwAdmin1+");

const firstNames = ["Emma", "Léo", "Noah", "Mia", "Lucas", "Jade", "Hugo", "Lina", "Liam", "Chloé"];

const femaleNames = ["Emma", "Mia", "Jade", "Lina", "Chloé"];
const users = [];

for (let i = 0; i < firstNames.length; i++) {
  const name = firstNames[i];
  const isFemale = femaleNames.includes(name);

  // Utilisation de randomuser.me pour des avatars réalistes
  const avatarIndex = faker.number.int({ min: 1, max: 99 }); // 1 à 99 disponibles
  const avatar = `https://randomuser.me/api/portraits/${isFemale ? "women" : "men"}/${avatarIndex}.jpg`;

  const user = await User.create({
    username: name.toLowerCase(),
    lastName: faker.person.lastName(),
    firstName: name,
    email: `${name.toLowerCase()}@mail.com`,
    password: memberPasswordHash,
    role: "member",
    avatar,
    description: faker.lorem.sentence(),
  });

  users.push(user);
  await user.addSkills(faker.helpers.shuffle(skills).slice(0, 2));
  await user.addWantedSkills(faker.helpers.shuffle(skills).slice(0, 2));
  await user.addAvailabilities(faker.helpers.shuffle(availabilities).slice(0, 5));
}

// Admin
await User.create({
  username: "AdminSkillSwap",
  lastName: "Admin",
  firstName: "Skillswap",
  email: "skillswap@mail.com",
  password: adminPasswordHash,
  role: "admin",
  avatar: "https://randomuser.me/api/portraits/men/0.jpg",
  description: "Administrateur de la plateforme SkillSwap",
});

// ----------------------
// 4. FOLLOWS
// ----------------------
for (const user of users) {
  const toFollow = faker.helpers
    .shuffle(users.filter((u) => u.id !== user.id))
    .slice(0, faker.number.int({ min: 2, max: 6 }));
  for (const followed of toFollow) {
    await user.addFollows(followed);
  }
}

// ----------------------
// 5. POSTS
// ----------------------
const posts = [];
for (const user of users) {
  for (let i = 0; i < 3; i++) {
    const skill = faker.helpers.arrayElement(skills);
    const post = await Post.create({
      title: faker.lorem.words(4),
      content: faker.lorem.paragraph(),
      user_id: user.id,
      skill_id: skill.id,
      isClosed: false,
    });
    posts.push(post);
  }
}

// ----------------------
// 6. PROPOSITIONS + REVIEWS
// ----------------------
const propositions = [];
for (const post of posts) {
  const receiver = post.user_id;
  const senders = faker.helpers.shuffle(users.filter((u) => u.id !== receiver)).slice(0, 2);

  for (const sender of senders) {
    const accepted = faker.datatype.boolean();
    const prop = await Proposition.create({
      content: faker.lorem.sentences(2),
      sender_id: sender.id,
      receiver_id: receiver,
      post_id: post.id,
      state: accepted ? "acceptée" : "refusée",
      isFinishedBySender: accepted,
      isFinishedByReceiver: accepted,
    });
    propositions.push(prop);

    if (accepted) {
      await Review.create({
        title: faker.lorem.words(3),
        grade: faker.number.int({ min: 3, max: 5 }),
        content: faker.lorem.sentences(2),
        user_id: receiver,
        reviewed_id: sender.id,
        proposition_id: prop.id,
      });
    }
  }
}

// ----------------------
// 7. MESSAGES
// ----------------------
for (const sender of users) {
  const others = faker.helpers.shuffle(users.filter((u) => u.id !== sender.id)).slice(0, 2);
  for (const receiver of others) {
    await Message.create({
      content: faker.lorem.sentence(),
      sender_id: sender.id,
      receiver_id: receiver.id,
    });
  }
}

console.log("\u2705 Seed terminé avec succès");
await sequelize.close();

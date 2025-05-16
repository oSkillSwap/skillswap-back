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
// 1. CRÉATION DES CATÉGORIES ET COMPÉTENCES
// ----------------------
const categoryData = [
  { name: "Informatique", skills: ["Mac", "Linux", "Windows", "Android", "Iphone"] },
  {
    name: "Programmation",
    skills: ["JS", "Python", "PHP", "NodeJS", "NGNIX", "Appache", "Wordpress"],
  },
  { name: "Développement personnel", skills: ["Respiration", "Yoga"] },
  {
    name: "Langues Etrangères",
    skills: [
      "Francais",
      "Anglais",
      "Italien",
      "Espagnol",
      "Allemand",
      "Mandarin",
      "Arabe",
      "Russe",
      "Japonnais",
    ],
  },
  { name: "Bricolage", skills: ["Maconnerie", "Electricité", "Plomberie"] },
  { name: "Scolaire", skills: ["Maths", "Géographie", "Histoire", "Physique", "Philo"] },
];

const categories = [];
const skills = [];

for (const cat of categoryData) {
  const category = await Category.create({
    name: cat.name,
    icon: faker.image.avatar(),
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
const adminPasswordHash = await argon2.hash("AdminSkillswap1+");

const firstNames = ["Emma", "Léo", "Noah", "Mia", "Lucas", "Jade", "Hugo", "Lina", "Liam", "Chloé"];
const users = [];

for (let i = 0; i < firstNames.length; i++) {
  const name = firstNames[i];
  const user = await User.create({
    username: name.toLowerCase(),
    lastName: faker.name.lastName(),
    firstName: name,
    email: `${name.toLowerCase()}@mail.com`,
    password: memberPasswordHash,
    role: "member",
    avatar: faker.image.avatar(),
    description: faker.lorem.sentence(),
  });
  users.push(user);
  await user.addSkills(faker.helpers.shuffle(skills).slice(0, 2));
  await user.addWantedSkills(faker.helpers.shuffle(skills).slice(0, 2));
  await user.addAvailabilities(faker.helpers.shuffle(availabilities).slice(0, 5));
}

// Admin
await User.create({
  username: "GregAdmin&8",
  lastName: "Virmaud",
  firstName: "Gregory",
  email: "virmaud.gregory@gmail.com",
  password: adminPasswordHash,
  role: "admin",
  avatar: faker.image.avatar(),
  description: "Administrateur de la plateforme",
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
// 6. PROPOSITIONS + ÉCHANGES TERMINÉS + REVIEWS
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

    // Si acceptée et terminée, on crée une review de l'auteur du post vers le sender
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

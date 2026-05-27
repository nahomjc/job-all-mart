import { relations } from "drizzle-orm/relations";
import { users, auditLogs, categories, jobs, jobViews, subscriptions, telegramPosts, telegramTopics, payments } from "./schema";

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.actorId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
	jobs: many(jobs),
	subscriptions: many(subscriptions),
	payments_userId: many(payments, {
		relationName: "payments_userId_users_id"
	}),
	payments_verifiedBy: many(payments, {
		relationName: "payments_verifiedBy_users_id"
	}),
}));

export const jobsRelations = relations(jobs, ({one, many}) => ({
	category: one(categories, {
		fields: [jobs.categoryId],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [jobs.userId],
		references: [users.id]
	}),
	jobViews: many(jobViews),
	telegramPosts: many(telegramPosts),
	payments: many(payments),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	jobs: many(jobs),
	telegramTopics: many(telegramTopics),
}));

export const jobViewsRelations = relations(jobViews, ({one}) => ({
	job: one(jobs, {
		fields: [jobViews.jobId],
		references: [jobs.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));

export const telegramPostsRelations = relations(telegramPosts, ({one}) => ({
	job: one(jobs, {
		fields: [telegramPosts.jobId],
		references: [jobs.id]
	}),
}));

export const telegramTopicsRelations = relations(telegramTopics, ({one}) => ({
	category: one(categories, {
		fields: [telegramTopics.categoryId],
		references: [categories.id]
	}),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	job: one(jobs, {
		fields: [payments.jobId],
		references: [jobs.id]
	}),
	user_userId: one(users, {
		fields: [payments.userId],
		references: [users.id],
		relationName: "payments_userId_users_id"
	}),
	user_verifiedBy: one(users, {
		fields: [payments.verifiedBy],
		references: [users.id],
		relationName: "payments_verifiedBy_users_id"
	}),
}));
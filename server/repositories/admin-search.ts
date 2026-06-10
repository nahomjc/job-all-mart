import "server-only";

import { jobRepo } from "@/server/repositories/job";
import { paymentRepo } from "@/server/repositories/payment";
import { userRepo } from "@/server/repositories/user";

export const adminSearchRepo = {
	async search(q: string, opts: { limit?: number } = {}) {
		const normalizedQ = q.trim();
		if (!normalizedQ) {
			return { jobs: [], users: [], payments: [] };
		}

		const limit = opts.limit ?? 10;
		const [jobs, users, payments] = await Promise.all([
			jobRepo.listAdminQueue({ q: normalizedQ, limit }),
			userRepo.listForAdmin({ q: normalizedQ, limit }),
			paymentRepo.listAdminPayments({ q: normalizedQ, limit }),
		]);

		return { jobs, users, payments };
	},
};

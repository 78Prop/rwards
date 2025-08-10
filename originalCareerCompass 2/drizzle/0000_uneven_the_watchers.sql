CREATE TABLE "miner_balances" (
	"rig_id" text NOT NULL,
	"user_id" text NOT NULL,
	"pool_id" text NOT NULL,
	"pending_balance" text DEFAULT '0',
	"confirmed_balance" text DEFAULT '0',
	"total_earned" text DEFAULT '0',
	"last_payout" timestamp
);
--> statement-breakpoint
CREATE TABLE "mining_rewards" (
	"reward_id" text PRIMARY KEY NOT NULL,
	"rig_id" text NOT NULL,
	"pool_id" text NOT NULL,
	"user_id" text,
	"reward_type" text NOT NULL,
	"currency" text DEFAULT 'BTC' NOT NULL,
	"amount" text NOT NULL,
	"share_contribution" text,
	"block_height" integer,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mining_rigs" (
	"rig_id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"rig_name" text NOT NULL,
	"hardware" text NOT NULL,
	"pool_id" text NOT NULL,
	"hash_capacity" text,
	"total_shares" integer DEFAULT 0,
	"accepted_shares" integer DEFAULT 0,
	"rejected_shares" integer DEFAULT 0,
	"total_earned" text DEFAULT '0',
	"status" text DEFAULT 'online' NOT NULL,
	"first_seen" timestamp DEFAULT now(),
	"last_seen" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pool_connections" (
	"rig_id" text NOT NULL,
	"user_id" text NOT NULL,
	"pool_id" text NOT NULL,
	"shares_submitted" integer DEFAULT 0,
	"shares_accepted" integer DEFAULT 0,
	"hash_rate" text,
	"last_update" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"email" text,
	"btc_address" text,
	"created_at" timestamp DEFAULT now(),
	"last_login" timestamp
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"withdrawal_id" text PRIMARY KEY NOT NULL,
	"rig_id" text NOT NULL,
	"pool_id" text NOT NULL,
	"user_id" text,
	"amount" text NOT NULL,
	"destination_address" text NOT NULL,
	"tx_hash" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rig_pool_bal_idx" ON "miner_balances" USING btree ("rig_id","pool_id");--> statement-breakpoint
CREATE INDEX "balance_user_idx" ON "miner_balances" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reward_rig_idx" ON "mining_rewards" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "reward_pool_idx" ON "mining_rewards" USING btree ("pool_id");--> statement-breakpoint
CREATE INDEX "reward_time_idx" ON "mining_rewards" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pool_idx" ON "mining_rigs" USING btree ("pool_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "mining_rigs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_rig_idx" ON "mining_rigs" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rig_pool_idx" ON "pool_connections" USING btree ("rig_id","pool_id");--> statement-breakpoint
CREATE INDEX "conn_user_idx" ON "pool_connections" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "withdrawal_rig_idx" ON "withdrawals" USING btree ("rig_id");--> statement-breakpoint
CREATE INDEX "withdrawal_pool_idx" ON "withdrawals" USING btree ("pool_id");--> statement-breakpoint
CREATE INDEX "withdrawal_status_idx" ON "withdrawals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "withdrawal_time_idx" ON "withdrawals" USING btree ("created_at");
#!/bin/bash
# Auto-answer all drizzle-kit prompts with Enter (select first option)
cd /home/ubuntu/40k_crusade_ai_manager
yes "" | pnpm drizzle-kit generate
pnpm drizzle-kit migrate

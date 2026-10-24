import { format } from "date-fns";
import { startOfWeek } from "@/lib/datetime";
import { GoalsSummary } from "./GoalsSummary";

export function WeeklyGoalsBanner() {
	return (
		<GoalsSummary
			periodType="weekly"
			periodStart={format(startOfWeek(new Date()), "yyyy-MM-dd")}
		/>
	);
}

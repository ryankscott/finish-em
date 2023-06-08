import { useMutation, useQuery } from "@apollo/client";
import {
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { add, format, startOfWeek, sub } from "date-fns";
import { ReactElement, useState } from "react";
import { Icons } from "../assets/icons";
import { WEEKLY_ITEMS, CREATE_WEEKLY_GOAL } from "../queries";
import { v4 as uuidv4 } from "uuid";
import EditableText from "./EditableText";
import ReorderableComponentList from "./ReorderableComponentList";
import { DailySummary } from "./DailySummary";
import { WeeklyGoal } from "../resolvers-types";
import Page from "./Page";

const weeklyFilter = JSON.stringify({
  combinator: "and",
  rules: [
    {
      field: "DATE(scheduledAt)",
      operator: "between",
      valueSource: "value",
      value: "week",
    },
    {
      field: "deleted",
      operator: "=",
      valueSource: "value",
      value: false,
    },
  ],
  not: false,
});

const WeeklyAgenda = (): ReactElement => {
  const componentKey = "ad127825-0574-48d7-a8d3-45375efb5342";
  const { colorMode } = useColorMode();
  const [currentDate, setCurrentDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [createWeeklyGoal] = useMutation(CREATE_WEEKLY_GOAL, {
    refetchQueries: [WEEKLY_ITEMS],
  });
  const { loading, error, data } = useQuery(WEEKLY_ITEMS, {
    variables: {
      filter: weeklyFilter,
      componentKey,
    },
  });
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  let weeklyGoal: WeeklyGoal = data.weeklyGoals.find(
    (w: WeeklyGoal) => w.week === format(currentDate, "yyyy-MM-dd")
  );
  if (!weeklyGoal) {
    weeklyGoal = {
      key: uuidv4(),
      week: format(currentDate, "yyyy-MM-dd"),
      goal: "",
    };
  }
  return (
    <Page>
      <Grid templateColumns="repeat(5, 1fr)" width="100%" my={5} mx={[0, 1]}>
        <GridItem colSpan={1} textAlign="start">
          <IconButton
            aria-label="back"
            size="md"
            variant="default"
            icon={<Icon as={Icons.back} />}
            onClick={() => {
              setCurrentDate(sub(currentDate, { days: 7 }));
            }}
          />
        </GridItem>
        <GridItem colSpan={3} textAlign="center">
          <Text
            fontWeight="normal"
            color="blue.500"
            fontSize="3xl"
            textAlign="center"
          >
            Week starting {format(currentDate, "EEEE do MMMM yyyy")}
          </Text>
        </GridItem>
        <GridItem colSpan={1} textAlign="end">
          <IconButton
            aria-label="forward"
            size="md"
            variant="default"
            icon={<Icon as={Icons.forward} />}
            onClick={() => {
              setCurrentDate(add(currentDate, { days: 7 }));
            }}
          />
        </GridItem>
      </Grid>
      <Flex justify="space-between" width="100%" marginBottom="5">
        <Text fontSize="md" style={{ gridArea: "week_of_year" }}>
          Week of year: {format(currentDate, "w")} / 52
        </Text>
        <Text
          fontSize="md"
          textAlign="end"
          style={{ gridArea: "week_of_quarter" }}
        >
          Week of quarter: {parseInt(format(currentDate, "w"), 10) % 13} / 13
        </Text>
      </Flex>
      <Flex
        direction="column"
        border="1px solid"
        borderRadius="md"
        borderColor={colorMode === "light" ? "gray.200" : "gray.600"}
        mx={0}
        my={[4, 4, 6, 6]}
        p={4}
        pl={[4, 4, 12, 12]}
      >
        <Text fontSize="lg" mb={3}>
          Weekly goals
        </Text>
        <EditableText
          key={weeklyGoal.key}
          singleLine={false}
          input={weeklyGoal.goal ?? ""}
          placeholder="Add a weekly goal..."
          shouldSubmitOnBlur
          shouldClearOnSubmit={false}
          onSubmit={(input) => {
            createWeeklyGoal({
              variables: {
                key: weeklyGoal?.key,
                week: weeklyGoal.week,
                goal: input,
              },
            });
          }}
        />
      </Flex>
      <Flex
        direction="column"
        alignItems={"center"}
        border="1px solid"
        borderColor="chakra-border-color"
        borderRadius="md"
      >
        <DailySummary
          startOfWeekDate={currentDate}
          items={data.items}
          calendarIntegrationEnabled={data.calendarIntegration.enabled}
        />
      </Flex>
      <ReorderableComponentList viewKey="6c40814f-8fad-40dc-9a96-0454149a9408" />
    </Page>
  );
};

export default WeeklyAgenda;

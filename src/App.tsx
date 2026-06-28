import { useState } from 'react';
import { Box, Tabs } from '@chakra-ui/react';
import { SetupTab } from './components/SetupTab';
import { GameTab } from './components/GameTab';
import { AskTab } from './components/AskTab';
import type { TeamMember } from './types';

const MAX_MEMBERS = 4;

function createDefaultTeam(team: 'red' | 'blue'): TeamMember[] {
  return Array.from({ length: MAX_MEMBERS }, (_, i) => ({
    id: `${team}-${i}`,
    team,
    name: '',
    unitType: '',
    legendary: false,
  }));
}

function App() {
  const [redTeam, setRedTeam] = useState<TeamMember[]>(() =>
    createDefaultTeam('red'),
  );
  const [blueTeam, setBlueTeam] = useState<TeamMember[]>(() =>
    createDefaultTeam('blue'),
  );

  return (
    <Box minH="100vh" bg="gray.950" color="white" p={4}>
      <Tabs.Root defaultValue="setup" size="lg">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="setup">Setup</Tabs.Trigger>
          <Tabs.Trigger value="game">Game</Tabs.Trigger>
          <Tabs.Trigger value="ask">Ask</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Content value="setup">
          <SetupTab
            redTeam={redTeam}
            blueTeam={blueTeam}
            onRedTeamChange={setRedTeam}
            onBlueTeamChange={setBlueTeam}
          />
        </Tabs.Content>

        <Tabs.Content value="game">
          <GameTab redTeam={redTeam} blueTeam={blueTeam} />
        </Tabs.Content>

        <Tabs.Content value="ask">
          <AskTab />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
}

export default App;

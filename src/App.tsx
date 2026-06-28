import { useState } from 'react';
import { Box, Tabs } from '@chakra-ui/react';
import { SetupTab } from './components/SetupTab';
import { GameTab } from './components/GameTab';
import { AskTab } from './components/AskTab';
import type { TeamMember } from './types';
import { SANGHEILI_NAMES, BLUE_UNIT_TYPES } from './types';

const MAX_MEMBERS = 4;

function createDefaultTeam(team: 'red' | 'blue'): TeamMember[] {
  return Array.from({ length: MAX_MEMBERS }, (_, i) => {
    let name: string;
    let unitType: string;

    if (team === 'red') {
      // Red team: random Sangheili name, Elite Mercenary
      name = SANGHEILI_NAMES[Math.floor(Math.random() * SANGHEILI_NAMES.length)];
      unitType = 'Elite Mercenary';
    } else {
      // Blue team: cycling Spartan types, generic names
      name = `Blue Member ${i + 1}`;
      unitType = BLUE_UNIT_TYPES[i % BLUE_UNIT_TYPES.length];
    }

    return {
      id: `${team}-${i}`,
      team,
      name,
      unitType,
      legendary: false,
    };
  });
}

function App() {
  const [redTeam, setRedTeam] = useState<TeamMember[]>(() =>
    createDefaultTeam('red'),
  );
  const [blueTeam, setBlueTeam] = useState<TeamMember[]>(() =>
    createDefaultTeam('blue'),
  );

  return (
    <Box display="flex" flexDirection="column" h="100vh" minH="0" bg="olive.900" color="olive.200" p={1}>
      <Tabs.Root defaultValue="setup" size="sm" flex={1} minH="0" display="flex" flexDirection="column">
        <Tabs.List mb={1} flexShrink={0}>
          <Tabs.Trigger value="setup">Setup</Tabs.Trigger>
          <Tabs.Trigger value="game">Game</Tabs.Trigger>
          <Tabs.Trigger value="ask">Ask</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>

        <Box flex={1} minH="0" overflow="hidden" display="flex" flexDirection="column">
          <Tabs.Content value="setup" h="100%" minH="0" overflow="hidden">
            <SetupTab
              redTeam={redTeam}
              blueTeam={blueTeam}
              onRedTeamChange={setRedTeam}
              onBlueTeamChange={setBlueTeam}
            />
          </Tabs.Content>

          <Tabs.Content value="game" h="100%" minH="0" overflow="hidden">
            <GameTab redTeam={redTeam} blueTeam={blueTeam} />
          </Tabs.Content>

          <Tabs.Content value="ask" h="100%" minH="0" overflow="hidden">
            <AskTab />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

export default App;

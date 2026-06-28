import {
  Badge,
  Box,
  Card,
  Checkbox,
  Field,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import type { TeamMember } from '../types';

const MAX_MEMBERS = 4;

interface TeamColumnProps {
  color: 'red' | 'blue';
  members: TeamMember[];
  onChange: (members: TeamMember[]) => void;
}

function legendaryCount(members: TeamMember[]): number {
  return members.filter((m) => m.legendary).length;
}

function activeCount(members: TeamMember[]): number {
  return Math.max(1, MAX_MEMBERS - legendaryCount(members));
}

function TeamColumn({ color, members, onChange }: TeamColumnProps) {
  const active = activeCount(members);
  const colorScheme = color === 'red' ? 'red' : 'blue';
  const borderColor = color === 'red' ? 'red.600' : 'blue.600';
  const bgColor = color === 'red' ? 'red.950' : 'blue.950';
  const headingColor = color === 'red' ? 'red.300' : 'blue.300';

  function updateMember(index: number, patch: Partial<TeamMember>) {
    const updated = members.map((m, i) => (i === index ? { ...m, ...patch } : m));
    onChange(updated);
  }

  function handleLegendaryChange(index: number, checked: boolean) {
    const currentLegendary = legendaryCount(members);
    // Prevent making more legendary than would leave at least 1 member
    if (checked && MAX_MEMBERS - (currentLegendary + 1) < 1) return;
    updateMember(index, { legendary: checked });
  }

  return (
    <Box flex={1} minW="280px">
      <Flex align="center" gap={3} mb={4}>
        <Heading size="lg" color={headingColor}>
          {color === 'red' ? 'Red Team' : 'Blue Team'}
        </Heading>
        <Badge colorPalette={colorScheme} variant="solid">
          {active} / {MAX_MEMBERS} active
        </Badge>
      </Flex>
      <Text fontSize="sm" color="gray.400" mb={4}>
        {active} member{active !== 1 ? 's' : ''} will participate in game.
        Legendary units reduce team size by 1.
      </Text>

      {members.map((member, i) => {
        const isActive = i < active;
        return (
          <Card.Root
            key={member.id}
            mb={3}
            bg={isActive ? bgColor : 'gray.800'}
            border="1px solid"
            borderColor={isActive ? borderColor : 'gray.600'}
            opacity={isActive ? 1 : 0.45}
          >
            <Card.Body gap={3}>
              <Flex align="center" justify="space-between">
                <Text fontWeight="bold" color={isActive ? headingColor : 'gray.500'}>
                  Member {i + 1}
                </Text>
                {member.legendary && (
                  <Badge colorPalette="yellow" variant="solid" fontSize="xs">
                    LEGENDARY
                  </Badge>
                )}
              </Flex>

              <Field.Root>
                <Field.Label fontSize="sm">Name</Field.Label>
                <Input
                  size="sm"
                  placeholder="Spartan callsign..."
                  value={member.name}
                  onChange={(e) => updateMember(i, { name: e.target.value })}
                  disabled={!isActive}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm">Unit Type</Field.Label>
                <Input
                  size="sm"
                  placeholder="e.g. Spartan, Elite, Grunt..."
                  value={member.unitType}
                  onChange={(e) => updateMember(i, { unitType: e.target.value })}
                  disabled={!isActive}
                />
              </Field.Root>

              <Checkbox.Root
                checked={member.legendary}
                onCheckedChange={(details) =>
                  handleLegendaryChange(i, !!details.checked)
                }
                disabled={!isActive && !member.legendary}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label fontSize="sm">
                  Legendary (reduces team size by 1)
                </Checkbox.Label>
              </Checkbox.Root>
            </Card.Body>
          </Card.Root>
        );
      })}
    </Box>
  );
}

interface SetupTabProps {
  redTeam: TeamMember[];
  blueTeam: TeamMember[];
  onRedTeamChange: (members: TeamMember[]) => void;
  onBlueTeamChange: (members: TeamMember[]) => void;
}

export function SetupTab({
  redTeam,
  blueTeam,
  onRedTeamChange,
  onBlueTeamChange,
}: SetupTabProps) {
  return (
    <Box pt={6}>
      <Heading size="xl" mb={2}>
        Fireteam Setup
      </Heading>
      <Text color="gray.400" mb={6}>
        Configure your fireteams before starting the game. Switch to the Game
        tab when ready.
      </Text>
      <Flex gap={6} flexWrap="wrap">
        <TeamColumn
          color="red"
          members={redTeam}
          onChange={onRedTeamChange}
        />
        <TeamColumn
          color="blue"
          members={blueTeam}
          onChange={onBlueTeamChange}
        />
      </Flex>
    </Box>
  );
}

import {
  Badge,
  Box,
  Card,
  Checkbox,
  Flex,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import type { TeamMember } from '../types';

const MAX_MEMBERS = 4;
const MIN_HP = 1;
const MAX_HP = 20;

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
  const borderColor = color === 'red' ? 'rust.500' : 'steel.500';
  const bgColor = color === 'red' ? 'rust.800' : 'steel.800';
  const headingColor = color === 'red' ? 'rust.200' : 'steel.300';

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

  function handleHpChange(index: number, rawValue: string) {
    const numeric = Number.parseInt(rawValue, 10);
    const hp = Number.isNaN(numeric)
      ? MIN_HP
      : Math.min(MAX_HP, Math.max(MIN_HP, numeric));
    updateMember(index, { hp });
  }

  return (
    <Box flex={1} minW="300px" h="100%" display="flex" flexDirection="column" p={1}>
      <Flex align="center" gap={1} mb={1} flexShrink={0}>
        <Heading size="xs" color={headingColor}>
          {color === 'red' ? 'Red Team' : 'Blue Team'}
        </Heading>
        <Badge colorPalette={colorScheme} variant="solid" fontSize="2xs">
          {active}/{MAX_MEMBERS}
        </Badge>
      </Flex>

      <Box flex={1} overflowY="auto" overflowX="hidden">
        {members.map((member, i) => {
          const isActive = i < active;
          return (
            <Card.Root
              key={member.id}
              mb={1}
              bg={isActive ? bgColor : 'olive.800'}
              border="1px solid"
              borderColor={isActive ? borderColor : 'olive.700'}
              opacity={isActive ? 1 : 0.55}
              p={1}
            >
              <Flex align="center" justify="space-between" gap={1} mb={1}>
                <Text fontWeight="bold" fontSize="2xs" color={isActive ? headingColor : 'olive.500'}>
                  #{i + 1}
                </Text>
                {member.legendary && (
                  <Badge colorPalette="yellow" variant="solid" fontSize="2xs">
                    LEG
                  </Badge>
                )}
              </Flex>

              <Flex gap={1} mb={1}>
                <Input
                  size="xs"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateMember(i, { name: e.target.value })}
                  disabled={!isActive}
                  bg="olive.900"
                  color="olive.200"
                  borderColor="olive.700"
                  _placeholder={{ color: 'olive.200', opacity: 0.8 }}
                />
                <Input
                  size="xs"
                  placeholder="Type"
                  value={member.unitType}
                  onChange={(e) => updateMember(i, { unitType: e.target.value })}
                  disabled={!isActive}
                  bg="olive.900"
                  color="olive.200"
                  borderColor="olive.700"
                  _placeholder={{ color: 'olive.200', opacity: 0.8 }}
                />
                <Input
                  size="xs"
                  type="number"
                  min={MIN_HP}
                  max={MAX_HP}
                  w="62px"
                  placeholder="HP"
                  value={member.hp}
                  onChange={(e) => handleHpChange(i, e.target.value)}
                  disabled={!isActive}
                  bg="olive.900"
                  color="olive.200"
                  borderColor="olive.700"
                />
              </Flex>

              <Checkbox.Root
                checked={member.legendary}
                onCheckedChange={(details) =>
                  handleLegendaryChange(i, !!details.checked)
                }
                disabled={!isActive && !member.legendary}
                size="sm"
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label fontSize="2xs">Legendary</Checkbox.Label>
              </Checkbox.Root>
            </Card.Root>
          );
        })}
      </Box>
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
    <Box h="100%" w="100%" p={1}>
      <Flex gap={1} h="100%" w="100%">
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

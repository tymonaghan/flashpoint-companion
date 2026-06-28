import { useState, useCallback } from 'react';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Field,
  Flex,
  Heading,
  Text,
  Textarea,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { FaCrosshairs, FaSkull } from 'react-icons/fa6';
import type { TeamMember, GameMember, CasualtyLog } from '../types';
import { BLUE_SPARTAN_NAMES } from '../types';

const MAX_MEMBERS = 4;
const MIN_HP = 1;
const DEAD_HP = 0;
const WARNING_HP = 2;
const SPECIAL_KILLERS = [
  { value: 'gravity', label: 'Gravity' },
  { value: 'guardians', label: 'The Guardians' },
] as const;

function activeCount(members: TeamMember[]): number {
  const legendary = members.filter((m) => m.legendary).length;
  return Math.max(1, MAX_MEMBERS - legendary);
}

function initGameMembers(
  redTeam: TeamMember[],
  blueTeam: TeamMember[],
): GameMember[] {
  const redActive = activeCount(redTeam);
  const blueActive = activeCount(blueTeam);

  const fromRed: GameMember[] = redTeam.slice(0, redActive).map((m) => ({
    id: m.id,
    name: m.name || `Red Member ${redTeam.indexOf(m) + 1}`,
    unitType: m.unitType || 'Unknown',
    team: 'red' as const,
    activated: false,
    killed: false,
    casualtyNotes: '',
    killedTurn: null,
    maxHp: m.hp,
    currentHp: m.hp,
    kills: 0,
    deaths: 0,
  }));

  const fromBlue: GameMember[] = blueTeam.slice(0, blueActive).map((m) => ({
    id: m.id,
    name: m.name || BLUE_SPARTAN_NAMES[blueTeam.indexOf(m) % BLUE_SPARTAN_NAMES.length],
    unitType: m.unitType || 'Unknown',
    team: 'blue' as const,
    activated: false,
    killed: false,
    casualtyNotes: '',
    killedTurn: null,
    maxHp: m.hp,
    currentHp: m.hp,
    kills: 0,
    deaths: 0,
  }));

  return [...fromRed, ...fromBlue];
}

// ---------- MemberCard ----------

interface MemberCardProps {
  member: GameMember;
  onActivate: (id: string, checked: boolean) => void;
  onHit: (id: string) => void;
  onRespawn: (id: string) => void;
  casualtyPending: boolean;
}

function MemberCard({
  member,
  onActivate,
  onHit,
  onRespawn,
  casualtyPending,
}: MemberCardProps) {
  const isRed = member.team === 'red';
  const borderColor = member.killed ? 'olive.700' : isRed ? 'rust.600' : 'steel.600';
  const bgColor = member.killed ? 'olive.900' : isRed ? 'rust.900' : 'steel.900';
  const hpBlock = member.currentHp === MIN_HP ? '🟥' : member.currentHp === WARNING_HP ? '🟨' : '🟩';
  const hpBlocks = member.currentHp > DEAD_HP ? hpBlock.repeat(member.currentHp) : '';

  return (
    <Flex
      align="center"
      justify="space-between"
      px={2}
      py={1}
      mb={1}
      border="1px solid"
      borderColor={borderColor}
      bg={bgColor}
      borderRadius="md"
      opacity={member.killed ? 0.55 : 1}
      gap={2}
      minH="0"
    >
      <Box flex={1} minW="0">
        <Text fontWeight="bold" fontSize="xs" color="olive.100" truncate>
          {member.name}
        </Text>
        <Text fontSize="xs" color="olive.400" truncate>
          {member.unitType}
        </Text>
        <Text fontSize="2xs" mt={0.5} color="olive.300" display="flex" alignItems="center" gap={1}>
          <FaCrosshairs />
          {member.kills}
        </Text>
        <Text fontSize="2xs" color="olive.300" display="flex" alignItems="center" gap={1}>
          <FaSkull />
          {member.deaths}
        </Text>
      </Box>
      <Text fontSize="2xs" color="olive.200" flexShrink={0}>
        HP {member.currentHp}/{member.maxHp} {hpBlocks}
      </Text>

      {member.killed ? (
        <HStack gap={2} flexShrink={0}>
          <Badge colorPalette="gray" variant="solid" fontSize="xs">KIA</Badge>
          <Button size="xs" colorPalette="green" variant="outline" onClick={() => onRespawn(member.id)}>
            Respawn
          </Button>
        </HStack>
      ) : (
        <HStack gap={2} flexShrink={0}>
          <Checkbox.Root
            checked={member.activated}
            onCheckedChange={(d) => onActivate(member.id, !!d.checked)}
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            <Checkbox.Label fontSize="xs" color="olive.300">Act</Checkbox.Label>
          </Checkbox.Root>
          <Button
            size="xs"
            colorPalette="red"
            variant="outline"
            onClick={() => onHit(member.id)}
            disabled={casualtyPending || member.killed}
          >
            HIT
          </Button>
        </HStack>
      )}
    </Flex>
  );
}

// ---------- Casualty Dialog ----------

interface CasualtyDialogProps {
  memberName: string;
  killerOptions: Array<{ value: string; label: string }>;
  open: boolean;
  onConfirm: (notes: string, killedBy: string) => void;
  onCancel: () => void;
}

function CasualtyDialog({
  memberName,
  killerOptions,
  open,
  onConfirm,
  onCancel,
}: CasualtyDialogProps) {
  const [notes, setNotes] = useState('');
  const [killedBy, setKilledBy] = useState('');

  const defaultKillerValue = SPECIAL_KILLERS[0]?.value ?? 'gravity';
  const firstOptionValue = killerOptions[0]?.value ?? defaultKillerValue;

  function handleConfirm() {
    onConfirm(notes, killedBy || firstOptionValue);
    setNotes('');
    setKilledBy('');
  }

  function handleCancel() {
    onCancel();
    setNotes('');
    setKilledBy('');
  }

  const selectedKiller = killedBy || firstOptionValue;

  return (
    <Dialog.Root open={open} onOpenChange={(d) => !d.open && handleCancel()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="olive.800" borderColor="olive.600" border="2px solid">
          <Dialog.Header>
            <Dialog.Title color="olive.100">Casualty Report — {memberName}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Field.Root>
              <Field.Label color="olive.200">Casualty Notes</Field.Label>
              <Textarea
                placeholder="Describe how they fell..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                autoFocus
                bg="olive.900"
                color="olive.200"
                borderColor="olive.700"
                _placeholder={{ color: 'olive.200', opacity: 0.6 }}
              />
            </Field.Root>
            <Field.Root mt={3}>
              <Field.Label color="olive.200">Killed By</Field.Label>
              <select
                value={selectedKiller}
                onChange={(e) => setKilledBy(e.target.value)}
                style={{
                  background: '#151C14',
                  color: '#dbe5c8',
                  border: '1px solid #4A5A44',
                  borderRadius: '6px',
                  padding: '8px',
                  width: '100%',
                }}
              >
                {killerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field.Root>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button bg="olive.700" color="olive.100" _hover={{ bg: "olive.600" }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button colorPalette="red" onClick={handleConfirm}>
              Confirm KIA
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// ---------- New Turn Dialog ----------

interface NewTurnDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function NewTurnDialog({ open, onConfirm, onCancel }: NewTurnDialogProps) {
  const [weaponsDropped, setWeaponsDropped] = useState(false);
  const [shieldsReplenished, setShieldsReplenished] = useState(false);
  const [commandDiceRolled, setCommandDiceRolled] = useState(false);

  const allChecked = weaponsDropped && shieldsReplenished && commandDiceRolled;

  function handleConfirm() {
    onConfirm();
    setWeaponsDropped(false);
    setShieldsReplenished(false);
    setCommandDiceRolled(false);
  }

  function handleCancel() {
    onCancel();
    setWeaponsDropped(false);
    setShieldsReplenished(false);
    setCommandDiceRolled(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(d) => !d.open && handleCancel()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="olive.800" borderColor="olive.600" border="2px solid">
          <Dialog.Header>
            <Dialog.Title color="olive.100">New Turn Checklist</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text color="olive.200" mb={4} fontWeight="500">
              Check off each item before starting the next turn.
            </Text>
            <VStack align="start" gap={4}>
              <Checkbox.Root
                checked={weaponsDropped}
                onCheckedChange={(d) => setWeaponsDropped(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label color="olive.200">Weapons dropped (collect weapon tokens)</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root
                checked={shieldsReplenished}
                onCheckedChange={(d) => setShieldsReplenished(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label color="olive.200">Shields replenished</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root
                checked={commandDiceRolled}
                onCheckedChange={(d) => setCommandDiceRolled(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label color="olive.200">Command dice rolled</Checkbox.Label>
              </Checkbox.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button bg="olive.700" color="olive.100" _hover={{ bg: "olive.600" }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              colorPalette="green"
              onClick={handleConfirm}
              disabled={!allChecked}
            >
              Start Next Turn
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// ---------- End Game Dialog ----------

interface EndGameDialogProps {
  open: boolean;
  redScore: number;
  blueScore: number;
  log: CasualtyLog[];
  onClose: () => void;
}

function EndGameDialog({
  open,
  redScore,
  blueScore,
  log,
  onClose,
}: EndGameDialogProps) {
  const winner =
    redScore > blueScore
      ? 'Red Team'
      : blueScore > redScore
        ? 'Blue Team'
        : 'Draw';

  const winnerColor =
    redScore > blueScore
      ? 'red.400'
      : blueScore > redScore
        ? 'blue.400'
        : 'yellow.400';

  return (
    <Dialog.Root open={open} onOpenChange={(d) => !d.open && onClose()} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="olive.800" borderColor="olive.600" border="2px solid">
          <Dialog.Header>
            <Dialog.Title color="olive.100">After Action Report</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Box textAlign="center" mb={4}>
              <Text fontSize="2xl" fontWeight="bold" color={winnerColor}>
                {winner === 'Draw' ? '⚔️ Draw!' : `🏆 ${winner} Wins!`}
              </Text>
              <HStack justify="center" gap={8} mt={2}>
                <Text color="rust.200" fontWeight="600">Red: {redScore} pts</Text>
                <Text color="steel.200" fontWeight="600">Blue: {blueScore} pts</Text>
              </HStack>
            </Box>

            <Heading size="md" mb={2} color="olive.100">
              Casualties (in order)
            </Heading>
            {log.length === 0 ? (
              <Text color="olive.400">No casualties recorded.</Text>
            ) : (
              <VStack align="stretch" gap={2} maxH="150px" overflowY="auto">
                {log.map((entry, i) => (
                  <Box
                    key={i}
                    p={2}
                    borderRadius="md"
                    bg={entry.team === 'red' ? 'rust.800' : 'steel.800'}
                    border="1px solid"
                    borderColor={entry.team === 'red' ? 'rust.600' : 'steel.600'}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="bold" color="olive.100">
                        #{entry.order} — {entry.memberName}{' '}
                        <Badge
                          colorPalette={entry.team === 'red' ? 'red' : 'blue'}
                          ml={1}
                          variant="solid"
                          fontSize="xs"
                        >
                          {entry.team === 'red' ? 'Red' : 'Blue'}
                        </Badge>
                      </Text>
                      <Text fontSize="xs" color="olive.400">
                        Turn {entry.turn}
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="olive.400">
                      {entry.unitType}
                    </Text>
                    <Text fontSize="xs" color="olive.300">
                      Killed by: {entry.killedBy}
                    </Text>
                    {entry.notes && (
                      <Text fontSize="xs" color="olive.200" fontStyle="italic" mt={1}>
                        "{entry.notes}"
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button colorPalette="green" onClick={onClose}>
              Close
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

// ---------- GameTab ----------

interface GameTabProps {
  redTeam: TeamMember[];
  blueTeam: TeamMember[];
}

export function GameTab({ redTeam, blueTeam }: GameTabProps) {
  const [members, setMembers] = useState<GameMember[]>(() =>
    initGameMembers(redTeam, blueTeam),
  );
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [turn, setTurn] = useState(1);
  const [log, setLog] = useState<CasualtyLog[]>([]);

  // Casualty dialog state
  const [casualtyTarget, setCasualtyTarget] = useState<string | null>(null);

  // New turn dialog
  const [showNewTurn, setShowNewTurn] = useState(false);

  // End game dialog
  const [showEndGame, setShowEndGame] = useState(false);

  // Whether game has been started (initialized from setup)
  const [initialized, setInitialized] = useState(false);

  const aliveMembersCount = members.filter((m) => !m.killed).length;
  const activatedAliveCount = members.filter((m) => !m.killed && m.activated).length;
  const allActivated = aliveMembersCount > 0 && activatedAliveCount === aliveMembersCount;

  const casualtyMember = members.find((m) => m.id === casualtyTarget) ?? null;
  const killerOptions =
    casualtyMember === null
      ? [...SPECIAL_KILLERS]
      : [
          ...members
            .filter((m) => m.team !== casualtyMember.team)
            .map((m) => ({ value: m.id, label: m.name })),
          ...SPECIAL_KILLERS,
        ];

  function handleRestart() {
    setMembers(initGameMembers(redTeam, blueTeam));
    setRedScore(0);
    setBlueScore(0);
    setTurn(1);
    setLog([]);
    setCasualtyTarget(null);
    setShowNewTurn(false);
    setShowEndGame(false);
    setInitialized(true);
  }

  const handleActivate = useCallback(
    (id: string, checked: boolean) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, activated: checked } : m)),
      );
    },
    [],
  );

  const handleHit = useCallback((id: string) => {
    let shouldOpenCasualty = false;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id || m.killed) return m;
        if (m.currentHp === MIN_HP) {
          shouldOpenCasualty = true;
          return { ...m, currentHp: DEAD_HP, activated: false };
        }
        return { ...m, currentHp: m.currentHp - 1, activated: false };
      }),
    );
    if (shouldOpenCasualty) {
      setCasualtyTarget(id);
    }
  }, []);

  const handleRespawn = useCallback((id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              killed: false,
              currentHp: m.maxHp,
              activated: false,
              casualtyNotes: '',
              killedTurn: null,
            }
          : m,
      ),
    );
  }, []);

  function handleCasualtyConfirm(notes: string, killedBy: string) {
    if (!casualtyTarget) return;
    const target = members.find((m) => m.id === casualtyTarget);
    if (!target) return;
    const killer = members.find((m) => m.id === killedBy) ?? null;
    const killedByLabel =
      killer?.name
      ?? SPECIAL_KILLERS.find((option) => option.value === killedBy)?.label
      ?? 'Unknown';

    setMembers((prev) =>
      prev.map((m) =>
        m.id === casualtyTarget
          ? {
              ...m,
              killed: true,
              casualtyNotes: notes,
              killedTurn: turn,
              activated: false,
              currentHp: DEAD_HP,
              deaths: m.deaths + 1,
            }
          : killer !== null && m.id === killer.id
            ? { ...m, kills: m.kills + 1 }
          : m,
      ),
    );

    // Opposing team scores
    if (target.team === 'red') {
      setBlueScore((s) => s + 1);
    } else {
      setRedScore((s) => s + 1);
    }

    setLog((prev) => [
      ...prev,
      {
        turn,
        order: prev.length + 1,
        memberName: target.name,
        unitType: target.unitType,
        team: target.team,
        notes,
        killedBy: killedByLabel,
      },
    ]);

    setCasualtyTarget(null);
  }

  function handleCasualtyCancel() {
    if (casualtyTarget) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === casualtyTarget && !m.killed && m.currentHp === DEAD_HP
            ? { ...m, currentHp: MIN_HP }
            : m,
        ),
      );
    }
    setCasualtyTarget(null);
  }

  function handleNextTurnConfirm() {
    setTurn((t) => t + 1);
    setMembers((prev) => prev.map((m) => ({ ...m, activated: false })));
    setShowNewTurn(false);
  }

  return (
    <Box h="100%" minH="0" display="flex" flexDirection="column">
      {/* Scoreboard */}
      <Flex
        align="center"
        justify="space-between"
        bg="olive.700"
        borderRadius="lg"
        px={4}
        py={2}
        mb={1}
        border="2px solid"
        borderColor="olive.600"
        flexShrink={0}
      >
        <Box textAlign="center" flex={1}>
          <Text fontSize="2xl" fontWeight="bold" color="rust.300" lineHeight="1">
            {redScore}
          </Text>
          <Text color="olive.300" fontSize="xs">Red</Text>
        </Box>
        <Box textAlign="center" px={4} borderLeft="2px solid" borderRight="2px solid" borderColor="olive.600">
          <Text fontSize="lg" fontWeight="bold" color="olive.100" lineHeight="1">T{turn}</Text>
          <Text fontSize="xs" color="olive.300">{activatedAliveCount}/{aliveMembersCount}</Text>
        </Box>
        <Box textAlign="center" flex={1}>
          <Text fontSize="2xl" fontWeight="bold" color="steel.300" lineHeight="1">
            {blueScore}
          </Text>
          <Text color="olive.300" fontSize="xs">Blue</Text>
        </Box>
      </Flex>

      {/* Action buttons */}
      <Flex gap={2} mb={1} justify="flex-end" flexShrink={0}>
        <Button
          size="sm"
          colorPalette={allActivated ? 'green' : 'yellow'}
          onClick={() => setShowNewTurn(true)}
          disabled={!initialized}
        >
          Next Turn
        </Button>
        <Button
          size="sm"
          colorPalette="green"
          variant="outline"
          onClick={handleRestart}
        >
          {initialized ? 'Restart Game' : 'Start Game'}
        </Button>
        <Button
          size="sm"
          colorPalette="red"
          variant="outline"
          onClick={() => setShowEndGame(true)}
          disabled={!initialized}
        >
          End Game
        </Button>
      </Flex>

      {!initialized && (
        <Box
          textAlign="center"
          p={8}
          bg="olive.900"
          borderRadius="xl"
          color="olive.400"
          border="1px solid"
          borderColor="olive.700"
        >
          <Text fontSize="lg" mb={2} color="olive.200">
            Configure your teams in the Setup tab, then click{' '}
            <strong>Start Game</strong> to begin.
          </Text>
        </Box>
      )}

      {initialized && (
        <Flex gap={3} flex={1} minH="0" overflow="hidden">
          {/* Red Team */}
          <Flex flex={1} minW="0" minH="0" direction="column" overflow="hidden">
            <Flex align="center" gap={2} mb={2} flexShrink={0}>
              <Heading size="md" color="rust.300">
                Red Team
              </Heading>
              <Badge bg="rust.700" color="rust.100" fontSize="xs">
                {members.filter((m) => m.team === 'red' && !m.killed).length}{' '}
                alive
              </Badge>
            </Flex>
            <Box flex={1} overflowY="auto">
              {members
                .filter((m) => m.team === 'red')
                .map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    onActivate={handleActivate}
                    onHit={handleHit}
                    onRespawn={handleRespawn}
                    casualtyPending={casualtyTarget === m.id}
                  />
                ))}
            </Box>
          </Flex>

          {/* Blue Team */}
          <Flex flex={1} minW="0" minH="0" direction="column" overflow="hidden">
            <Flex align="center" gap={2} mb={2} flexShrink={0}>
              <Heading size="md" color="steel.300">
                Blue Team
              </Heading>
              <Badge bg="steel.700" color="steel.100" fontSize="xs">
                {members.filter((m) => m.team === 'blue' && !m.killed).length}{' '}
                alive
              </Badge>
            </Flex>
            <Box flex={1} overflowY="auto">
              {members
                .filter((m) => m.team === 'blue')
                .map((m) => (
                  <MemberCard
                    key={m.id}
                    member={m}
                    onActivate={handleActivate}
                    onHit={handleHit}
                    onRespawn={handleRespawn}
                    casualtyPending={casualtyTarget === m.id}
                  />
                ))}
            </Box>
          </Flex>
        </Flex>
      )}

      {/* Dialogs */}
      <CasualtyDialog
        memberName={casualtyMember?.name ?? ''}
        killerOptions={killerOptions}
        open={casualtyTarget !== null}
        onConfirm={handleCasualtyConfirm}
        onCancel={handleCasualtyCancel}
      />

      <NewTurnDialog
        open={showNewTurn}
        onConfirm={handleNextTurnConfirm}
        onCancel={() => setShowNewTurn(false)}
      />

      <EndGameDialog
        open={showEndGame}
        redScore={redScore}
        blueScore={blueScore}
        log={log}
        onClose={() => setShowEndGame(false)}
      />
    </Box>
  );
}

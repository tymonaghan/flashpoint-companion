import { useState, useCallback } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
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
import type { TeamMember, GameMember, CasualtyLog } from '../types';

const MAX_MEMBERS = 4;

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
  }));

  const fromBlue: GameMember[] = blueTeam.slice(0, blueActive).map((m) => ({
    id: m.id,
    name: m.name || `Blue Member ${blueTeam.indexOf(m) + 1}`,
    unitType: m.unitType || 'Unknown',
    team: 'blue' as const,
    activated: false,
    killed: false,
    casualtyNotes: '',
    killedTurn: null,
  }));

  return [...fromRed, ...fromBlue];
}

// ---------- MemberCard ----------

interface MemberCardProps {
  member: GameMember;
  onActivate: (id: string, checked: boolean) => void;
  onKill: (id: string) => void;
}

function MemberCard({ member, onActivate, onKill }: MemberCardProps) {
  const isRed = member.team === 'red';
  const borderColor = member.killed
    ? 'gray.600'
    : isRed
      ? 'red.600'
      : 'blue.600';
  const bgColor = member.killed
    ? 'gray.800'
    : isRed
      ? 'red.950'
      : 'blue.950';

  return (
    <Card.Root
      border="1px solid"
      borderColor={borderColor}
      bg={bgColor}
      opacity={member.killed ? 0.5 : 1}
      mb={3}
    >
      <Card.Body gap={2}>
        <Flex align="center" justify="space-between" wrap="wrap" gap={2}>
          <Box>
            <Text fontWeight="bold" fontSize="md">
              {member.name}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {member.unitType}
            </Text>
          </Box>
          <HStack gap={2}>
            {member.killed && (
              <Badge colorPalette="gray" variant="solid">
                KIA
              </Badge>
            )}
            {member.activated && !member.killed && (
              <Badge colorPalette="green" variant="solid">
                Activated
              </Badge>
            )}
          </HStack>
        </Flex>

        {!member.killed && (
          <Flex gap={3} align="center" wrap="wrap">
            <Checkbox.Root
              checked={member.activated}
              onCheckedChange={(d) => onActivate(member.id, !!d.checked)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label fontSize="sm">Activated</Checkbox.Label>
            </Checkbox.Root>

            <Button
              size="xs"
              colorPalette="red"
              variant="outline"
              onClick={() => onKill(member.id)}
            >
              Mark Killed
            </Button>
          </Flex>
        )}

        {member.killed && member.casualtyNotes && (
          <Text fontSize="xs" color="gray.400" fontStyle="italic">
            "{member.casualtyNotes}"
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
}

// ---------- Casualty Dialog ----------

interface CasualtyDialogProps {
  memberName: string;
  open: boolean;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
}

function CasualtyDialog({
  memberName,
  open,
  onConfirm,
  onCancel,
}: CasualtyDialogProps) {
  const [notes, setNotes] = useState('');

  function handleConfirm() {
    onConfirm(notes);
    setNotes('');
  }

  function handleCancel() {
    onCancel();
    setNotes('');
  }

  return (
    <Dialog.Root open={open} onOpenChange={(d) => !d.open && handleCancel()}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content bg="gray.900" borderColor="gray.700" border="1px solid">
          <Dialog.Header>
            <Dialog.Title>Casualty Report — {memberName}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Field.Root>
              <Field.Label>Casualty Notes</Field.Label>
              <Textarea
                placeholder="Describe how they fell..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                autoFocus
              />
            </Field.Root>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button variant="outline" onClick={handleCancel}>
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
        <Dialog.Content bg="gray.900" borderColor="gray.700" border="1px solid">
          <Dialog.Header>
            <Dialog.Title>New Turn Checklist</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text color="gray.400" mb={4}>
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
                <Checkbox.Label>Weapons dropped (collect weapon tokens)</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root
                checked={shieldsReplenished}
                onCheckedChange={(d) => setShieldsReplenished(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>Shields replenished</Checkbox.Label>
              </Checkbox.Root>
              <Checkbox.Root
                checked={commandDiceRolled}
                onCheckedChange={(d) => setCommandDiceRolled(!!d.checked)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Label>Command dice rolled</Checkbox.Label>
              </Checkbox.Root>
            </VStack>
          </Dialog.Body>
          <Dialog.Footer gap={3}>
            <Button variant="outline" onClick={handleCancel}>
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
        <Dialog.Content bg="gray.900" borderColor="gray.700" border="1px solid">
          <Dialog.Header>
            <Dialog.Title>After Action Report</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Box textAlign="center" mb={6}>
              <Text fontSize="2xl" fontWeight="bold" color={winnerColor}>
                {winner === 'Draw' ? '⚔️ Draw!' : `🏆 ${winner} Wins!`}
              </Text>
              <HStack justify="center" gap={8} mt={2}>
                <Text color="red.300">Red: {redScore} pts</Text>
                <Text color="blue.300">Blue: {blueScore} pts</Text>
              </HStack>
            </Box>

            <Heading size="md" mb={3}>
              Casualties (in order)
            </Heading>
            {log.length === 0 ? (
              <Text color="gray.500">No casualties recorded.</Text>
            ) : (
              <VStack align="stretch" gap={2}>
                {log.map((entry, i) => (
                  <Box
                    key={i}
                    p={3}
                    borderRadius="md"
                    bg={entry.team === 'red' ? 'red.950' : 'blue.950'}
                    border="1px solid"
                    borderColor={entry.team === 'red' ? 'red.700' : 'blue.700'}
                  >
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="bold">
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
                      <Text fontSize="sm" color="gray.400">
                        Turn {entry.turn}
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.400">
                      {entry.unitType}
                    </Text>
                    {entry.notes && (
                      <Text fontSize="sm" color="gray.300" fontStyle="italic" mt={1}>
                        "{entry.notes}"
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            )}
          </Dialog.Body>
          <Dialog.Footer>
            <Button colorPalette="blue" onClick={onClose}>
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

  const handleKill = useCallback((id: string) => {
    setCasualtyTarget(id);
  }, []);

  function handleCasualtyConfirm(notes: string) {
    if (!casualtyTarget) return;
    const target = members.find((m) => m.id === casualtyTarget);
    if (!target) return;

    setMembers((prev) =>
      prev.map((m) =>
        m.id === casualtyTarget
          ? { ...m, killed: true, casualtyNotes: notes, killedTurn: turn, activated: false }
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
      },
    ]);

    setCasualtyTarget(null);
  }

  function handleCasualtyCancel() {
    setCasualtyTarget(null);
  }

  function handleNextTurnConfirm() {
    setTurn((t) => t + 1);
    setMembers((prev) =>
      prev.map((m) => (m.killed ? m : { ...m, activated: false })),
    );
    setShowNewTurn(false);
  }

  return (
    <Box pt={6}>
      {/* Scoreboard */}
      <Flex
        align="center"
        justify="space-between"
        bg="gray.800"
        borderRadius="xl"
        p={4}
        mb={6}
        wrap="wrap"
        gap={4}
      >
        <Box textAlign="center" flex={1}>
          <Text fontSize="3xl" fontWeight="bold" color="red.400">
            {redScore}
          </Text>
          <Text color="red.300" fontSize="sm">
            Red Team
          </Text>
        </Box>

        <Box textAlign="center">
          <Text fontSize="lg" fontWeight="bold" color="gray.300">
            Turn {turn}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {activatedAliveCount} / {aliveMembersCount} activated
          </Text>
        </Box>

        <Box textAlign="center" flex={1}>
          <Text fontSize="3xl" fontWeight="bold" color="blue.400">
            {blueScore}
          </Text>
          <Text color="blue.300" fontSize="sm">
            Blue Team
          </Text>
        </Box>
      </Flex>

      {/* Action buttons */}
      <Flex gap={3} mb={6} justify="flex-end" wrap="wrap">
        <Button
          colorPalette="green"
          onClick={() => setShowNewTurn(true)}
          disabled={!allActivated || !initialized}
        >
          Next Turn
        </Button>
        <Button
          colorPalette="yellow"
          variant="outline"
          onClick={handleRestart}
        >
          {initialized ? 'Restart Game' : 'Start Game'}
        </Button>
        <Button
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
          p={12}
          bg="gray.800"
          borderRadius="xl"
          color="gray.400"
        >
          <Text fontSize="lg" mb={2}>
            Configure your teams in the Setup tab, then click{' '}
            <strong>Start Game</strong> to begin.
          </Text>
        </Box>
      )}

      {initialized && (
        <Flex gap={6} flexWrap="wrap">
          {/* Red Team */}
          <Box flex={1} minW="280px">
            <Flex align="center" gap={2} mb={3}>
              <Heading size="md" color="red.300">
                Red Team
              </Heading>
              <Badge colorPalette="red" variant="solid">
                {members.filter((m) => m.team === 'red' && !m.killed).length}{' '}
                alive
              </Badge>
            </Flex>
            {members
              .filter((m) => m.team === 'red')
              .map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onActivate={handleActivate}
                  onKill={handleKill}
                />
              ))}
          </Box>

          {/* Blue Team */}
          <Box flex={1} minW="280px">
            <Flex align="center" gap={2} mb={3}>
              <Heading size="md" color="blue.300">
                Blue Team
              </Heading>
              <Badge colorPalette="blue" variant="solid">
                {members.filter((m) => m.team === 'blue' && !m.killed).length}{' '}
                alive
              </Badge>
            </Flex>
            {members
              .filter((m) => m.team === 'blue')
              .map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onActivate={handleActivate}
                  onKill={handleKill}
                />
              ))}
          </Box>
        </Flex>
      )}

      {/* Dialogs */}
      <CasualtyDialog
        memberName={casualtyMember?.name ?? ''}
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

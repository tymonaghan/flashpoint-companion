import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Field,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import type { ChatMessage } from '../types';
import { HALO_FLASHPOINT_SYSTEM_PROMPT } from '../haloRules';

export function AskTab() {
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !apiKey.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const key = apiKey.trim();
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + key,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: HALO_FLASHPOINT_SYSTEM_PROMPT },
            ...updatedMessages,
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData?.error?.message ?? `API error ${response.status}`,
        );
      }

      const data = await response.json();
      const reply: string =
        data?.choices?.[0]?.message?.content ?? 'No response received.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <Box maxW="800px" mx="auto" pt={6}>
      <Heading size="xl" mb={4}>
        Ask the Rules Assistant
      </Heading>
      <Text color="gray.400" mb={4}>
        Ask any question about Halo: Flashpoint rules. The assistant has access
        to the full ruleset and will answer in plain language.
      </Text>

      <Field.Root mb={6}>
        <Field.Label>OpenAI API Key</Field.Label>
        <Input
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <Field.HelperText>
          Your key is used locally and never stored.
        </Field.HelperText>
      </Field.Root>

      <Box
        border="1px solid"
        borderColor="gray.700"
        borderRadius="md"
        minH="400px"
        maxH="500px"
        overflowY="auto"
        p={4}
        mb={4}
        bg="gray.900"
        display="flex"
        flexDirection="column"
        gap={3}
      >
        {messages.length === 0 && (
          <Text color="gray.500" alignSelf="center" mt="auto" mb="auto">
            Ask a rules question to get started.
          </Text>
        )}
        {messages.map((msg, i) => (
          <Box
            key={i}
            alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            maxW="80%"
            bg={msg.role === 'user' ? 'blue.700' : 'gray.700'}
            px={4}
            py={2}
            borderRadius="lg"
          >
            <Text fontSize="sm" fontWeight="bold" mb={1} color={msg.role === 'user' ? 'blue.200' : 'green.200'}>
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </Text>
            <Text whiteSpace="pre-wrap">{msg.content}</Text>
          </Box>
        ))}
        {loading && (
          <Box alignSelf="flex-start">
            <Spinner size="sm" color="green.400" />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {error && (
        <Text color="red.400" mb={2} fontSize="sm">
          Error: {error}
        </Text>
      )}

      <VStack gap={2} align="stretch">
        <Textarea
          placeholder="Ask a rules question... (Enter to send, Shift+Enter for newline)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
          disabled={loading}
        />
        <Flex justify="flex-end">
          <Button
            colorPalette="blue"
            onClick={sendMessage}
            loading={loading}
            disabled={!input.trim() || !apiKey.trim()}
          >
            Send
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

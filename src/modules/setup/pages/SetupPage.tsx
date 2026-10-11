import { Alert, Anchor, Button, Container, List, PasswordInput, Stack, Text, Title } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState, type ChangeEvent, type ReactElement } from 'react';
import { sessionKeys } from '@/modules/training';
import { DATA_REPO_NAME, DATA_REPO_OWNER, TOKEN_SETUP_URL } from '@/shared/constants';
import { fetchSessionsFile, GitHubError, setToken } from '@/shared/services';
import { SessionsFileError } from '@/shared/utils';

export const SetupPage = (): ReactElement => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.currentTarget.value);
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    const token = value.trim();
    if (!token) {
      setError('Paste the token first.');
      return;
    }
    setChecking(true);
    setError(null);
    try {
      await fetchSessionsFile(token);
      setToken(token);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      await navigate({ to: '/' });
    } catch (caught) {
      const known = caught instanceof GitHubError || caught instanceof SessionsFileError;
      setError(known ? caught.message : 'Could not check the token. Try again.');
    } finally {
      setChecking(false);
    }
  }, [value, navigate, queryClient]);

  return (
    <Container size="xs" px="md" py="xl">
      <Stack gap="md">
        <Title order={1} tt="uppercase">Kholysthenics</Title>
        <Text>Your log lives in the {DATA_REPO_OWNER}/{DATA_REPO_NAME} repo on GitHub. Connect it once with a token:</Text>
        <List type="ordered" spacing="xs">
          <List.Item>
            Open <Anchor href={TOKEN_SETUP_URL} target="_blank" rel="noreferrer" id="setup-token-link">GitHub → new fine-grained token</Anchor>.
          </List.Item>
          <List.Item>Repository access: <b>Only select repositories</b> → <b>{DATA_REPO_NAME}</b>.</List.Item>
          <List.Item>Permissions → Repository → <b>Contents: Read and write</b>.</List.Item>
          <List.Item>Expiration: the longest offered. Generate, then copy the token.</List.Item>
        </List>
        <PasswordInput
          id="setup-token"
          label="GitHub token"
          placeholder="github_pat_…"
          value={value}
          onChange={handleChange}
          autoComplete="off"
        />
        {error ? <Alert color="red" id="setup-error">{error}</Alert> : null}
        <Button id="setup-save" size="lg" loading={checking} onClick={handleSave}>Connect</Button>
        <Text size="sm" c="dimmed">The token stays on this phone only.</Text>
      </Stack>
    </Container>
  );
};

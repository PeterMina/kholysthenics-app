import { createLazyFileRoute } from '@tanstack/react-router';
import { BlockPage } from '@/modules/training';

export const Route = createLazyFileRoute('/_authenticated/block')({ component: BlockPage });

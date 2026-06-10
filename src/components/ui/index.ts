/**
 * UI Kit Shigueno — componentes reutilizáveis do painel.
 *
 * import { Button, Modal, ConfirmModal, Card, StatCard, Badge, Field, Input } from './ui';
 */
export { default as Button } from './Button';
export type { ButtonVariant, ButtonSize, ButtonProps } from './Button';

export { default as Modal, ConfirmModal } from './Modal';
export type { ModalProps, ModalSize, ConfirmModalProps } from './Modal';

export { default as Card, StatCard, SectionHeader } from './Card';
export type { CardProps, StatCardProps, StatTone } from './Card';

export { default as Badge, statusTone } from './Badge';
export type { BadgeProps, BadgeTone } from './Badge';

export { Field, Input, Select, Textarea } from './Field';

export { default as EmptyState } from './EmptyState';
export { default as Toast } from './Toast';
export type { ToastTone } from './Toast';
export { default as Skeleton, SkeletonDashboard, SkeletonRows } from './Skeleton';

export { default as NotificationBell, buildNotifications } from './NotificationBell';
export type { NotificationItem } from './NotificationBell';

export { default as QuickNotes } from './QuickNotes';

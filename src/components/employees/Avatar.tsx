import React from 'react';
import { Employee, avatarBg } from './helpers';

/**
 * Avatar do funcionário — foto do banco ou iniciais coloridas.
 */
export default function Avatar({ emp, size = 'md', ring = false }: {
  emp: Pick<Employee, 'id' | 'full_name' | 'avatar_initials' | 'photo_path'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Anel branco para sobrepor banners/headers */
  ring?: boolean;
}) {
  const sz = size === 'sm' ? 'w-8 h-8 text-xs'
    : size === 'md' ? 'w-10 h-10 text-sm'
    : size === 'lg' ? 'w-16 h-16 text-lg'
    : 'w-20 h-20 sm:w-24 sm:h-24 text-2xl';
  const rounded = size === 'xl' || size === 'lg' ? 'rounded-2xl' : 'rounded-xl';
  const ringCls = ring ? 'ring-4 ring-white shadow-lg' : '';

  if (emp.photo_path) {
    return <img src={`/api/employees/${emp.id}/photo`} alt={emp.full_name} className={`${sz} ${rounded} ${ringCls} object-cover shrink-0`} />;
  }
  return (
    <div className={`${sz} ${rounded} ${ringCls} ${avatarBg(emp.id)} flex items-center justify-center text-white font-black shrink-0`}>
      {emp.avatar_initials || emp.full_name.slice(0, 2).toUpperCase()}
    </div>
  );
}

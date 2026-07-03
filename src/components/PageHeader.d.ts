import type { ComponentType, ReactElement } from 'react';

interface PageHeaderProps {
  title: string;
  icon?: ReactElement;
  subtitle?: string;
  actions?: ReactElement;
}

const PageHeader: ComponentType<PageHeaderProps>;
export default PageHeader;
import type { ReactNode } from 'react'

type PageHeadingProps = {
  id?: string
  title: string
  description: ReactNode
  actions?: ReactNode
}

function PageHeading({ id, title, description, actions }: PageHeadingProps) {
  return (
    <header className="workspace-heading">
      <div>
        <h1 id={id}>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="workspace-heading-actions">{actions}</div>}
    </header>
  )
}

export default PageHeading

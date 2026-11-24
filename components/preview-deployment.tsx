import {
  Database,
  GitBranch,
  GitPullRequest,
  PanelsTopLeft,
  Pause,
  Play,
} from 'lucide-react'

const lanes = [
  {
    label: 'Production',
    Icon: GitPullRequest,
    nodeX: 94,
    name: 'main',
    color: '#ffb88e',
    path: 'M-6 63H574',
    end: 63,
    delay: '0s',
  },
  {
    label: 'Deployment',
    Icon: PanelsTopLeft,
    nodeX: 215,
    name: 'preview/search',
    color: '#bcabff',
    path: 'M94 63C143 63 125 152 190 152H574',
    end: 152,
    delay: '1.15s',
  },
  {
    label: 'Database',
    Icon: Database,
    nodeX: 318,
    name: 'postgres/search',
    color: '#7fdcc6',
    path: 'M215 152C262 152 250 235 311 235H574',
    end: 235,
    delay: '2.35s',
  },
] as const

export function PreviewDeployment() {
  return (
    <figure className="deployment">
      <input
        id="pause-deployment"
        type="checkbox"
        className="motion-input"
        aria-label="Pause deployment animation"
      />
      <figcaption>
        <span>
          <GitBranch size={17} />
          Layerbase Cloud
        </span>
        <label htmlFor="pause-deployment" title="Toggle animation">
          <Pause size={15} className="pause-icon" />
          <Play size={15} className="play-icon" />
          <span className="pause-copy">Pause</span>
          <span className="play-copy">Play</span>
        </label>
      </figcaption>
      <h2>Preview environments</h2>
      <div className="deployment-plot">
        <svg
          viewBox="0 0 560 266"
          role="img"
          aria-label="An example feature branch creates a preview deployment connected to its own Postgres database branch. Production stays on main."
        >
          <defs>
            <pattern
              id="deployment-grid"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r=".9" fill="#797a99" opacity=".38" />
            </pattern>
          </defs>
          <rect width="560" height="266" fill="url(#deployment-grid)" />
          {lanes.map((lane) => (
            <g key={lane.name} style={{ color: lane.color }}>
              <path className="lane-bed" d={lane.path} />
              <path className="lane-line" d={lane.path} />
              <path
                className="lane-packet"
                pathLength="100"
                d={lane.path}
                style={{ animationDelay: lane.delay }}
              />
              <text
                className="lane-name"
                x="529"
                y={lane.end - 13}
                textAnchor="end"
              >
                {lane.name}
              </text>
              <circle
                cx="532"
                cy={lane.end}
                r="4"
                fill="#191821"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
          ))}
          <g className="commit-points">
            {[28, 183, 251, 361, 436].map((x) => (
              <circle key={x} cx={x} cy="63" r="3" />
            ))}
          </g>
          {lanes.map(({ Icon, label, nodeX, end, color, delay }) => (
            <g
              key={label}
              transform={`translate(${nodeX} ${end})`}
              style={{ color }}
            >
              <rect
                className="node-halo"
                x="-27"
                y="-27"
                width="54"
                height="54"
                rx="14"
                style={{ animationDelay: delay }}
              />
              <rect
                x="-21"
                y="-18"
                width="42"
                height="42"
                rx="10"
                fill="#0e0d14"
                stroke="currentColor"
                strokeOpacity=".45"
              />
              <rect
                x="-21"
                y="-22"
                width="42"
                height="42"
                rx="10"
                fill="#292630"
                stroke="currentColor"
              />
              <Icon x="-11" y="-12" width={22} height={22} strokeWidth={1.6} />
            </g>
          ))}
        </svg>
      </div>
      <div className="deployment-legend">
        {lanes.map((lane) => (
          <span key={lane.label}>
            <i style={{ background: lane.color }} />
            {lane.label}
          </span>
        ))}
      </div>
      <div className="deployment-events" aria-hidden="true">
        <span className="event-prompt">›</span>
        <div>
          <span>git switch -c preview/search</span>
          <span>Forking postgres/main into postgres/search</span>
          <span>Connected preview/search to postgres/search</span>
        </div>
      </div>
      <div className="deployment-caption">
        A database branch for every preview.{' '}
        <a href="https://layerbase.com/docs/integrations/vercel">
          See the integration
        </a>
      </div>
    </figure>
  )
}

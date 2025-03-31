import React, { JSX } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Privacy-First Design',
    icon: 'shield-check',
    description: (
      <>
        Built from the ground up with privacy as the core principle.
        All votes are submitted through Ring Signatures, ensuring
        nobody—not even the poll creator—can see individual responses.
      </>
    ),
  },
  {
    title: 'Telegram & Discord Bots',
    icon: 'message-bot',
    description: (
      <>
        Create and manage polls directly within your community's 
        favorite platforms. Simple command interface makes blockchain
        polling accessible to non-technical users.
      </>
    ),
  },
  {
    title: 'Starknet Powered',
    icon: 'blockchain',
    description: (
      <>
        Leverage the scalability and security of Starknet's L2 solution
        without the high gas fees. Fast confirmation times and 
        cryptographic guarantees for your poll results.
      </>
    ),
  },
  {
    title: 'Customizable Polls',
    icon: 'settings',
    description: (
      <>
        Create multiple choice polls, yes/no questions, or scaled 
        responses. Set eligibility requirements, voting periods, 
        and custom verification methods.
      </>
    ),
  },
  {
    title: 'Verifiable Results',
    icon: 'check-badge',
    description: (
      <>
        Despite the privacy guarantees, all results are cryptographically
        verifiable on-chain. Get reliable data without compromising
        voter anonymity.
      </>
    ),
  },
  {
    title: 'Developer-Friendly',
    icon: 'code',
    description: (
      <>
        Comprehensive API and SDKs <em>soon</em> available for custom integrations.
        Extend Nebula Vote's functionality with webhooks, custom frontends,
        or integrate with your existing applications.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('card card--nebula', styles.featureCard)}>
        <div className="card__header">
          <div className={styles.featureIcon}>
            <i className={`feather icon-${icon}`}></i>
          </div>
          <h3>{title}</h3>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={clsx('features--nebula', styles.features)}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>Key Features</h2>
          <p>Everything you need for private and secure community polling</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
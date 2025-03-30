import React, { JSX } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--nebula', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className={styles.buttons}>
              <Link
                className="button button--lg button--nebula-gradient"
                to="/docs/">
                Get Started
              </Link>
            </div>
          </div>
          <div className={styles.heroGraphic}>
            <img 
              src="/img/nebulavote-illustration.svg" 
              alt="Nebula Vote Illustration" 
              className={styles.heroImage} 
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Private opinion polling on Starknet blockchain">
      <HomepageHeader />
      <main>
        <div className="container margin-vert--xl">
          <div className="row">
            <div className="col col--6">
              <div className={styles.sectionTitle}>
                <h2>Private On-Chain Polling <span className="accent-cosmic-coral">Powered by Starknet</span></h2>
              </div>
              <div className={styles.sectionDescription}>
                <p>
                  Nebula Vote leverages Starknet's scalability and fee efficiency to enable 
                  fully private opinion polling without compromising data integrity 
                  or voter anonymity. Our bots for Telegram and Discord make 
                  blockchain polling accessible to everyone.
                </p>
                <p>
                  <strong>Perfect for:</strong> DAOs, community governance, sentiment analysis, 
                  and private consensus building.
                </p>
              </div>
            </div>
            <div className="col col--6">
              <div className={styles.featureBox}>
                <div className={clsx('card card--nebula', styles.featureCard)}>
                  <div className="card__header">
                    <h3>Ring Signature Privacy</h3>
                  </div>
                  <div className="card__body">
                    <p>
                      Vote with complete privacy while maintaining the integrity of results.
                      Our implementation uses Starknet's Cairo language for efficient proof verification.
                    </p>
                  </div>
                </div>

                <div className={clsx('card card--nebula', styles.featureCard)}>
                  <div className="card__header">
                    <h3>Seamless Integration</h3>
                  </div>
                  <div className="card__body">
                    <p>
                      Deploy on Telegram and Discord with minimal setup.
                      Polls can be created with a simple command and shared instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
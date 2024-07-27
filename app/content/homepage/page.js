"use client";
import { useRouter } from 'next/navigation';
import styles from '@/app/styles/home.module.css';

export default function Homepage() {
  const router = useRouter();
  const defaultName = "Player"; 

  const handleStart = () => {
    router.push(`/content/game?name=${defaultName}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <img src="/img/logo.png" alt="XO Game Logo" className={styles.logo} />
        <h1>XO GAME</h1>
        <button onClick={handleStart} className={styles.startButton}>START</button>
        
      </div>
    </div>
  );
}

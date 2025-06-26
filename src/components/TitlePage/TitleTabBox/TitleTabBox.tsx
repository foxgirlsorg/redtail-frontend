'use client';
import styles from "@/components/TitlePage/TitleTabBox/TitleTabBox.module.css"
import { IonIcon } from '../../IonIcon';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "@/components/TitlePage/TitleTabBox/tabs.css"
import {finished} from "node:stream";


type TitleTabBoxProps = {
    title: any;
};

export const TitleTabBox = ({title}:TitleTabBoxProps) => {
    return (
        <div className={styles.titleTabBox}>
            <Tabs>
                <TabList>
                    <Tab>Информация</Tab>
                    {title.chapters && (
                        <Tab>Главы</Tab>
                    )}
                </TabList>

                <TabPanel>
                    <div className={styles.info}>
                        <p className={styles.desciption}>{title.description}</p>
                        {(title.mangalib_url || title.readmanga_url || title.remanga_url) && (
                            <div className={styles.links}>
                                <h3 className={styles.smallTitle}>Наш перевод на других сайтах</h3>
                                <span className={styles.linksButtons}>
                                    {title.mangalib_url && (
                                        <a href={title.mangalib_url} target="_blank" className={styles.linkButton}>
                                            <IonIcon src="/icons/mangalib.svg" />
                                            MangaLIB
                                        </a>
                                    )}
                                    {title.readmanga_url && (
                                        <a href={title.readmanga_url} target="_blank" className={styles.linkButton}>
                                            <IonIcon src="/icons/readmanga.svg" />
                                            ReadManga
                                        </a>
                                    )}
                                    {title.remanga_url && (
                                        <a href={title.remanga_url} target="_blank" className={styles.linkButton}>
                                            <IonIcon src="/icons/remanga.svg" />
                                            Remanga
                                        </a>
                                    )}
                                </span>
                            </div>
                        )}

                    </div>
                </TabPanel>
                {title.chapters && (
                    <TabPanel>
                        <div className={styles.tabList}>
                            {title.chapters.map((chapter:any, i:number) => (
                                <div className={title.chapterItem}>
                                    {chapter.name}
                                </div>
                            ))}
                        </div>
                    </TabPanel>
                )}
            </Tabs>
        </div>
    );
};


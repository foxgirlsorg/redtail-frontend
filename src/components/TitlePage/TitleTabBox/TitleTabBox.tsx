'use client';

import styles from "@/components/TitlePage/TitleTabBox/TitleTabBox.module.css";
import { IonIcon } from '../../IonIcon';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { ChapterButton } from './ChapterButton/ChapterButton';
import "@/components/TitlePage/TitleTabBox/tabs.css";
import { InfoBox } from "@/components/TitlePage/InfoBox/InfoBox";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {SmallMemberCard} from "@/components/SmallMemberCard/SmallMemberCard";
import CusdisComments from "@/components/CusdisComments";


type TitleTabBoxProps = {
    title: any;
    cusdisHost: string;
    cusdisAppId: string;
    strDomain?: string;
};

export const TitleTabBox = ({ title, cusdisHost, cusdisAppId, strDomain }: TitleTabBoxProps) => {
    const searchParams = useSearchParams();
    const router = useRouter();

    const hasChapters = title.chapters.length > 0;
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        if (searchParams.has("chapters") && hasChapters) {
            if (hasChapters) {
                setTabIndex(1);
            }
        }
        if (searchParams.has("comments") && hasChapters) {
            if (hasChapters) {
                setTabIndex(2);
            } else {
                setTabIndex(1);
            }
        }
    }, [searchParams, hasChapters]);

    const handleTabChange = (index: number) => {
        setTabIndex(index);

        const url = new URL(window.location.href);
        const baseUrl = url.origin + url.pathname;

        if (index === 1 && hasChapters) {
            router.replace(baseUrl + "?chapters");
        } else if ((index === 1 && !hasChapters) || index === 2) {
            router.replace(baseUrl + "?comments");
        } else {
            router.replace(baseUrl);
        }
    };

    return (
        <div className={styles.titleTabBox}>
            <Tabs selectedIndex={tabIndex} onSelect={handleTabChange}>
                <TabList>
                    <Tab>Информация</Tab>
                    {hasChapters && <Tab>Главы</Tab>}
                    <Tab>Комментарии</Tab>
                </TabList>

                <TabPanel>
                    <div className={styles.info}>
                        <p className={styles.description}>{title.description}</p>

                        {(title.mangalib_url || title.readmanga_url || title.remanga_url) && (
                            <div className={styles.links}>
                                <h3 className={styles.smallTitle}>Наш перевод на других сайтах</h3>
                                <div className={styles.linkButtons}>
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
                                </div>
                            </div>
                        )}

                        {title.members_worked_ons.length > 0 && (
                            <div>
                                <h3 className={styles.smallTitle}>Над переводом работали</h3>
                                <div className={styles.members}>
                                    {title.members_worked_ons.map((member: any, i: number) => (
                                        <SmallMemberCard
                                            key={i}
                                            strDomain={strDomain}
                                            nickname={member.nickname}
                                            imgUrl={member.image?.formats?.thumbnail?.url}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.infoBox}>
                            <h3 className={styles.smallTitle}>Информация о тайтле</h3>
                            <InfoBox title={title} />
                        </div>
                    </div>
                </TabPanel>

                {hasChapters && (
                    <TabPanel>
                        <div className={styles.chapterList}>
                            {title.chapters.map((chapter: any, i: number) => (
                                <ChapterButton slug={title.slug} chapter={chapter} key={i} />
                            ))}
                        </div>
                    </TabPanel>
                )}

                <TabPanel forceRender>
                    <div className={styles.comments}>
                        <CusdisComments
                            host={cusdisHost}
                            appId={cusdisAppId}
                            pageId={title.documentId}
                            pageTitle={`Title | ${title.name}`}
                            bgColor="#232324"
                        />
                    </div>
                </TabPanel>
            </Tabs>
        </div>
    );
};

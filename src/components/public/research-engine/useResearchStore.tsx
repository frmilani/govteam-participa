"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ResearchState {
    answers: Record<string, string>; // categoryId -> estabelecimentoId or free text
    qualityAnswers: Record<string, Record<string, string>>; // categoryId -> { perguntaId -> resposta }
    currentStep: number;
}

interface ResearchActions {
    setAnswer: (categoryId: string, answer: string) => void;
    setQualityAnswer: (categoryId: string, perguntaId: string, answer: string) => void;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

type ResearchStore = ResearchState & ResearchActions;

const ResearchContext = createContext<ResearchStore | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ResearchState>({
        answers: {},
        qualityAnswers: {},
        currentStep: 0,
    });

    const setAnswer = (categoryId: string, answer: string) => {
        setState((prev) => ({
            ...prev,
            answers: { ...prev.answers, [categoryId]: answer },
        }));
    };

    const setQualityAnswer = (categoryId: string, perguntaId: string, answer: string) => {
        setState((prev) => ({
            ...prev,
            qualityAnswers: {
                ...prev.qualityAnswers,
                [categoryId]: {
                    ...(prev.qualityAnswers[categoryId] || {}),
                    [perguntaId]: answer,
                },
            },
        }));
    };

    const nextStep = () => {
        setState((prev) => ({ ...prev, currentStep: prev.currentStep + 1 }));
    };

    const prevStep = () => {
        setState((prev) => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
    };

    const reset = () => {
        setState({ answers: {}, qualityAnswers: {}, currentStep: 0 });
    };

    return (
        <ResearchContext.Provider value={{ ...state, setAnswer, setQualityAnswer, nextStep, prevStep, reset }}>
            {children}
        </ResearchContext.Provider>
    );
};

export const useResearchStore = (): ResearchStore => {
    const context = useContext(ResearchContext);
    if (!context) {
        throw new Error("useResearchStore must be used within a ResearchProvider");
    }
    return context;
};

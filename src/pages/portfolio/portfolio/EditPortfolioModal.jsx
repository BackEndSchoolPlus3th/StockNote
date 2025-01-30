
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const EditPortfolioModal = ({
    isOpen,
    onClose,
    portfolioData,
    onEdit
}) => {
    const [editPortfolio, setEditPortfolio] = useState({
        name: portfolioData.name || "",
        description: portfolioData.description || ""
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
                <h2 className="text-xl font-bold mb-4">포트폴리오 수정</h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">포트폴리오 이름</label>
                        <Input
                            type="text"
                            value={editPortfolio.name}
                            onChange={(e) => setEditPortfolio({ ...editPortfolio, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">설명</label>
                        <Input
                            type="text"
                            value={editPortfolio.description}
                            onChange={(e) => setEditPortfolio({ ...editPortfolio, description: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button onClick={() => onEdit(editPortfolio)}>
                            수정
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
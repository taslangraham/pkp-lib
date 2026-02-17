<?php

/**
 * @file classes/migrations/upgrade/v3_6_0/I12046_AssignMachineReadableRecommendationType
 * Copyright (c) 2025 Simon Fraser University
 * Copyright (c) 2025 John Willinsky
 * Distributed under the GNU GPL v3. For full terms see the file docs/COPYING.
 *
 * @class I12046_AssignMachineReadableRecommendationType
 *
 * @brief Add new column, type, to reviewer_recommendations table to support machine readable identifiers for reviewer recommendations.
 */

namespace PKP\migration\upgrade\v3_6_0;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use PKP\migration\Migration;
use PKP\submission\reviewer\recommendation\enums\ReviewerRecommendationType;

class I12046_AssignMachineReadableRecommendationType extends Migration
{
    public function log(string $message): void
    {
        fwrite(STDOUT, $message . PHP_EOL);
    }
    /**
     * @inheritDoc
     */
    public function up(): void
    {
        $this->log('inside parent up()');
        Schema::table('reviewer_recommendations', function (Blueprint $table) {
            if (!Schema::hasColumn('reviewer_recommendations', 'type')) {
                $table
                    ->enum('type', array_column(ReviewerRecommendationType::cases(), 'value'))
                    ->nullable();
            }
        });

        $this->log('after parent up() run ' . Schema::hasColumn('reviewer_recommendations', 'type')?'hasColumn':'noColumn');
    }

    /**
     * @inheritDoc
     */
    public function down(): void
    {
        Schema::table('reviewer_recommendations', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
}

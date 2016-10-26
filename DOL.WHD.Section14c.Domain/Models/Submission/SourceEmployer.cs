﻿using System;
using System.ComponentModel.DataAnnotations;

namespace DOL.WHD.Section14c.Domain.Models.Submission
{
    public class SourceEmployer : BaseEntity
    {
        public SourceEmployer()
        {
            Id = Guid.NewGuid();
        }

        public Guid Id { get; set; }

        [Required]
        public string EmployerName { get; set; }

        [Required]
        public virtual Address Address { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required]
        public string ContactName { get; set; }

        [Required]
        public string ContactTitle { get; set; }

        [Required]
        public DateTime ContactDate { get; set; }

        [Required]
        public string JobDescription { get; set; }

        [Required]
        public string ExperiencedWorkerWageProvided { get; set; }

        [Required]
        public string ConclusionWageRateNotBasedOnEntry { get; set; }
    }
}
